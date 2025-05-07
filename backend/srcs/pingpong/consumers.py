# pingpong/consumers.py
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from .models import GameSession, remoteGameSession
from .tasks import game_loop
from channels.db import database_sync_to_async
import redis
from .tasks import BAR0_x, BAR1_x

from channels.consumer import get_handler_name

redis_conn = redis.Redis(host='redis', port=6379, db=1)

class normalPingpongConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['game_id']
        self.room_group_name = 'pingpong_%s' % self.room_name

        try:
            self.game_session = await database_sync_to_async(GameSession.objects.get)(id=self.room_name)
        except GameSession.DoesNotExist:
            await self.close()
            return

        self.game_session.bar0_x = BAR0_x
        self.game_session.bar1_x = BAR1_x
        await self.save_game_session_to_redis(self.game_session)
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        game_loop.delay(self.room_group_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

        game_id = self.room_name
        game_status = redis_conn.hgetall(game_id)
        if game_status.get(b'game_state', b'').decode('utf-8') != 'end':
            redis_conn.set(f'disconnect_{self.room_group_name}', 1)
        redis_conn.delete(game_id)
        await database_sync_to_async(self.game_session.delete)()

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message_type = text_data_json['type']

        if message_type != 'keydown' and message_type != 'keyup':
            return
        
        signal = text_data_json['signal']
        
        bar0_move = 0
        bar1_move = 0
        if message_type == 'keydown':
            if signal == "p0_up":
                bar0_move = 1
            elif signal == "p0_down":
                bar0_move = -1
            elif signal == "p1_up":
                bar1_move = 1
            elif signal == "p1_down":
                bar1_move = -1
        elif message_type == 'keyup':
            if signal == "p0_stop":
                bar0_move = 0
            elif signal == "p1_stop":
                bar1_move = 0
            
        redis_conn.hset(self.room_name, 'bar0_move', bar0_move)
        redis_conn.hset(self.room_name, 'bar1_move', bar1_move)

    async def objects_position_update(self, event):
        await self.send(text_data=json.dumps({
            'message_type': "position",
            'ball_x': event['ball_x'],
            'ball_y': event['ball_y'],
            'bar0_x': event['bar0_x'],
            'bar0_y': event['bar0_y'],
            'bar1_x': event['bar1_x'],
            'bar1_y': event['bar1_y'],
        }))

    async def game_start(self, event):
        await self.send(text_data=json.dumps({
            'message_type': "start",
        }))

    async def score_change(self, event):
        await self.send(text_data=json.dumps({
            'message_type': "score",
            'score0': event['score0'],
            'score1': event['score1'],
            'scorer': event['scorer'],
        }))

    async def game_over(self, event):
        await self.send(text_data=json.dumps({
            'message_type': "game_over",
            'winner': event['winner'],
		}))

    async def save_game_session_to_redis(self, game_session):
        game_data = {
            'ball_x': game_session.ball_x,
            'ball_y': game_session.ball_y,
            'ball_speed': game_session.ball_speed,
            'ball_xvec': game_session.ball_xvec,
            'ball_yvec': game_session.ball_yvec,
            'bar0_x': game_session.bar0_x,
            'bar0_y': game_session.bar0_y,
            'bar0_move': game_session.bar0_move,
            'bar1_x': game_session.bar1_x,
            'bar1_y': game_session.bar1_y,
            'bar1_move': game_session.bar1_move,
            'score0': game_session.score0,
            'score1': game_session.score1,
            'serve': game_session.serve,
            'game_state': game_session.game_state,
        }
        redis_conn.hmset(self.room_name, game_data)

    async def delete_game_session_from_redis(self):
        await redis_conn.delete(self.room_name)



class RemotePingpongConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['game_id']
        self.room_group_name = 'remotePingpong_%s' % self.room_name

        try:
            self.game_session = await database_sync_to_async(GameSession.objects.get)(id=self.room_name)
            self.remote_game_session = await database_sync_to_async(remoteGameSession.objects.get)(game_session=self.game_session)
            self.player1_username = self.remote_game_session.player1_name
            self.player2_username = self.remote_game_session.player2_name
        except GameSession.DoesNotExist:
            await self.send(text_data=json.dumps({
            'error': "Room not exist!",
        }))
            await self.close()
            return
        except remoteGameSession.DoesNotExist:
            await self.send(text_data=json.dumps({
            'error': "Room not exist!",
        }))
            await self.close()
            return

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

        current_user = self.scope['user']
        redis_conn.set(f"player_ready_{self.room_name}_{current_user.username}", 1)
        redis_conn.set(f"player_channel_{self.room_name}_{current_user.username}", self.channel_name)

        await self.send(text_data=json.dumps({
            'message_type': "players_info",
            'player1_name': self.player1_username,
            'player2_name': self.player2_username,
        }))

        player1_key = f"player_ready_{self.room_name}_{self.player1_username}"
        player2_key = f"player_ready_{self.room_name}_{self.player2_username}"
        if redis_conn.get(player1_key) and redis_conn.get(player2_key):
            self.game_session.bar0_x = BAR0_x
            self.game_session.bar1_x = BAR1_x
            await self.save_game_session_to_redis(self.game_session)
            game_loop.delay(self.room_group_name)

    async def disconnect(self, close_code):
        game_id = self.room_name
        game_status = redis_conn.hgetall(game_id)
        disconnected_user = self.scope['user']
        redis_conn.set(f"player_disconnected_{self.room_name}_{disconnected_user.username}", 1)
        game_state = game_status.get(b'game_state', b'').decode('utf-8')
        if game_state != 'end':
            await self.channel_layer.group_send(self.room_group_name,
                {
                    "type": "chat.message5",
                    'message_type': 'opponent_disconnected',
                    'disconnected_user': disconnected_user.username,
                }
            )
            redis_conn.set(f'disconnect_{self.room_group_name}', 1)
            redis_conn.hset(game_id, 'game_state', 'end')
        else:
            player1_disconnected = f"player_disconnected_{self.room_name}_{self.player1_username}"
            player2_disconnected = f"player_disconnected_{self.room_name}_{self.player2_username}"
            if redis_conn.get(player1_disconnected) and redis_conn.get(player2_disconnected):
                redis_conn.delete(game_id)
                redis_conn.delete(f"player_ready_{self.room_name}_{self.player1_username}")
                redis_conn.delete(f"player_ready_{self.room_name}_{self.player2_username}")
                redis_conn.delete(f"player_channel_{self.room_name}_{self.player1_username}")
                redis_conn.delete(f"player_channel_{self.room_name}_{self.player2_username}")
                redis_conn.delete(f"player_disconnected_{self.room_name}_{self.player1_username}")
                redis_conn.delete(f"player_disconnected_{self.room_name}_{self.player2_username}")
                await database_sync_to_async(self.game_session.delete)()
                await database_sync_to_async(self.remote_game_session.delete)()

        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)



    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message_type = text_data_json['type']

        if message_type != 'keydown' and message_type != 'keyup':
            return
        
        signal = text_data_json['signal']
        
        bar0_move = 0
        bar1_move = 0
        if message_type == 'keydown':
            if signal == "p0_up":
                bar0_move = 1
            elif signal == "p0_down":
                bar0_move = -1
            elif signal == "p1_up":
                bar1_move = 1
            elif signal == "p1_down":
                bar1_move = -1
        elif message_type == 'keyup':
            if signal == "p0_stop":
                bar0_move = 0
            elif signal == "p1_stop":
                bar1_move = 0
            
        redis_conn.hset(self.room_name, 'bar0_move', bar0_move)
        redis_conn.hset(self.room_name, 'bar1_move', bar1_move)

    async def objects_position_update(self, event):
        await self.channel_layer.group_send(self.room_group_name, {
            "type": "chat.message1", 
            'message_type': "position",
            'ball_x': event['ball_x'],
            'ball_y': event['ball_y'],
            'bar0_x': event['bar0_x'],
            'bar0_y': event['bar0_y'],
            'bar1_x': event['bar1_x'],
            'bar1_y': event['bar1_y'],
        })
    async def chat_message1(self, event):
        message_type = event["message_type"]
        ball_x = event["ball_x"]
        ball_y = event["ball_y"]
        bar0_x = event["bar0_x"]
        bar0_y = event["bar0_y"]
        bar1_x = event["bar1_x"]
        bar1_y = event["bar1_y"]

        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            "message_type": message_type, 
            "ball_x":ball_x,
            "ball_y":ball_y,
            "bar0_x":bar0_x,
            "bar0_y":bar0_y,
            "bar1_x":bar1_x,
            "bar1_y":bar1_y,
            }))

    async def game_start(self, event):
        await self.channel_layer.group_send(self.room_group_name, {
            "type": "chat.message2", 
            'message_type': "start",
        })
    async def chat_message2(self, event):
        message_type = event["message_type"]
        await self.send(text_data=json.dumps({
            "message_type": message_type, 
            }))

    async def score_change(self, event):
        await self.channel_layer.group_send(self.room_group_name, {
            "type": "chat.message3", 
            'message_type': "score",
            'score0': event['score0'],
            'score1': event['score1'],
            'scorer': event['scorer'],
        })
    async def chat_message3(self, event):
        message_type = event["message_type"]
        score0 = event["score0"]
        score1 = event["score1"]
        scorer = event["scorer"]

        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            "message_type": message_type, 
            "score0":score0,
            "score1":score1,
            "scorer":scorer,
            }))

    async def game_over(self, event):
        await self.channel_layer.group_send(self.room_group_name, {
            "type": "chat.message4", 
            'message_type': "game_over",
            'winner': event['winner'],
		})
    async def chat_message4(self, event):
        message_type = event["message_type"]
        winner = event["winner"]

        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            "message_type": message_type, 
            "winner":winner,
            }))
    async def chat_message5(self, event):
        message_type = event["message_type"]
        disconnected_user = event["disconnected_user"]

        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            "message_type": message_type, 
            "disconnected_user":disconnected_user,
            }))

    async def save_game_session_to_redis(self, game_session):
        game_data = {
            'ball_x': game_session.ball_x,
            'ball_y': game_session.ball_y,
            'ball_speed': game_session.ball_speed,
            'ball_xvec': game_session.ball_xvec,
            'ball_yvec': game_session.ball_yvec,
            'bar0_x': game_session.bar0_x,
            'bar0_y': game_session.bar0_y,
            'bar0_move': game_session.bar0_move,
            'bar1_x': game_session.bar1_x,
            'bar1_y': game_session.bar1_y,
            'bar1_move': game_session.bar1_move,
            'score0': game_session.score0,
            'score1': game_session.score1,
            'serve': game_session.serve,
            'game_state': game_session.game_state,
        }
        redis_conn.hmset(self.room_name, game_data)

    async def delete_game_session_from_redis(self):
        await redis_conn.delete(self.room_name)

    async def dispatch(self, message):
        try:
            # 기존 dispatch 로직
            handler = getattr(self, get_handler_name(message))
            if handler:
                await handler(message)
        except ValueError as e:
            if str(e) == "Incoming message has no 'type' attribute":
                # 'type' 속성이 없는 메시지 처리 로직
                await self.send(text_data=json.dumps({
                    'error': "Invalid message format. Missing 'type' attribute."
                }))