# pingpong/tasks.py
from celery import shared_task
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from .models import GameSession
import redis
import random
from math import sqrt
from time import sleep

redis_conn = redis.Redis(host='redis', port=6379, db=1) 

GAME_WIDTH = 1400
GAME_HEIGHT = 900
BALL_RADIUS = 20
BAR_WIDTH = 20
BAR_HEIGHT = 200
BAR_SPEED = 30
BAR0_x = (GAME_WIDTH / -2) + (BAR_WIDTH / 2)
BAR1_x = (GAME_WIDTH / 2) - (BAR_WIDTH / 2)
INITIAL_BALL_SPEED = 20
WINNING_SCORE = 5

@shared_task
def game_loop(room_group_name):
    channel_layer = get_channel_layer()
    game_id = room_group_name.split('_')[1]
    try:
        # 웹소켓 연결 끊어졌으면 redis에서 게임 정보 지우고 task 끝
        if redis_conn.exists(f'disconnect_{room_group_name}'):
            redis_conn.delete(f'disconnect_{room_group_name}')
            return

        # 게임 세션 정보 가져오기
        game_session_data = redis_conn.hgetall(game_id)

        # 게임 상태 변수 가져오기
        ball_x = float(game_session_data[b'ball_x'])
        ball_y = float(game_session_data[b'ball_y'])
        ball_speed = float(game_session_data[b'ball_speed'])
        ball_xvec = float(game_session_data[b'ball_xvec'])
        ball_yvec = float(game_session_data[b'ball_yvec'])
        bar0_y = float(game_session_data[b'bar0_y'])
        bar0_move = int(game_session_data[b'bar0_move'])
        bar1_y = float(game_session_data[b'bar1_y'])
        bar1_move = int(game_session_data[b'bar1_move'])
        score0 = int(game_session_data[b'score0'])
        score1 = int(game_session_data[b'score1'])
        serve = int(game_session_data[b'serve'])
        game_state = str(game_session_data[b'game_state'].decode('utf-8'))
        score_flag = False
        scorer = 0

        if game_state == "start":
            ball_x, ball_y = 0, 0
            bar0_y, bar1_y = 0, 0
            ball_speed = INITIAL_BALL_SPEED
            ball_xvec = random.random() * 0.4 + 0.6
            ball_yvec = sqrt(1 - ball_xvec ** 2)
            if serve == 0:
                ball_yvec = ball_yvec * (-1 if score1 % 2 == 0 else 1)
            else:
                ball_xvec *= -1
                ball_yvec = ball_yvec * (-1 if score0 % 2 == 0 else 1)

        elif game_state == "playing":
            # 1. 바 이동
            if bar0_move == -1 and bar0_y - BAR_HEIGHT / 2 > -GAME_HEIGHT / 2:
                bar0_y -= BAR_SPEED
            elif bar0_move == 1 and bar0_y + BAR_HEIGHT / 2 < GAME_HEIGHT / 2:
                bar0_y += BAR_SPEED
            elif bar1_move == -1 and bar1_y - BAR_HEIGHT / 2 > -GAME_HEIGHT / 2:
                bar1_y -= BAR_SPEED
            elif bar1_move == 1 and bar1_y + BAR_HEIGHT / 2 < GAME_HEIGHT / 2:
                bar1_y += BAR_SPEED

            # 2. 공 이동
            ball_x += (ball_speed * ball_xvec)
            ball_y += (ball_speed * ball_yvec)

            # 3. 충돌 감지 및 처리
            # 3-1. 벽 충돌
            if ball_y + BALL_RADIUS >= GAME_HEIGHT / 2:
                ball_y = GAME_HEIGHT / 2 - BALL_RADIUS
                ball_yvec = -ball_yvec
            elif ball_y - BALL_RADIUS <= -GAME_HEIGHT / 2:
                ball_y = -GAME_HEIGHT / 2 + BALL_RADIUS
                ball_yvec = -ball_yvec
            # 3-2. 바 충돌
            if (
                ball_x - BALL_RADIUS <= -GAME_WIDTH / 2 + BAR_WIDTH 
                and bar0_y - (BAR_HEIGHT + BALL_RADIUS) / 2 <= ball_y <= bar0_y + (BAR_HEIGHT + BALL_RADIUS) / 2
            ):
                ball_yvec = ball_yvec + ((ball_y - bar0_y) / (BAR_HEIGHT / 2)) / 3
                if ball_yvec > 0.87:
                    ball_yvec = 0.87
                elif ball_yvec < -0.87:
                    ball_yvec = -0.87
                ball_xvec = sqrt(1 - ball_yvec ** 2)
                ball_x = -GAME_WIDTH / 2 + BAR_WIDTH + BALL_RADIUS
            elif (
                ball_x + BALL_RADIUS >= GAME_WIDTH / 2 - BAR_WIDTH
                and bar1_y - (BAR_HEIGHT + BALL_RADIUS) / 2 <= ball_y <= bar1_y + (BAR_HEIGHT + BALL_RADIUS) / 2
            ):
                ball_yvec = ball_yvec + ((ball_y - bar1_y) / (BAR_HEIGHT / 2)) / 3
                if ball_yvec > 0.87:
                    ball_yvec = 0.87
                elif ball_yvec < -0.87:
                    ball_yvec = -0.87
                ball_xvec = sqrt(1 - ball_yvec ** 2) * -1
                ball_x = GAME_WIDTH / 2 - BAR_WIDTH - BALL_RADIUS

            # 3-3. 득점
            if ball_x - BALL_RADIUS <= -GAME_WIDTH / 2:
                score1 += 1
                scorer = 1
                redis_conn.hset(game_id, 'serve', 0)
                score_flag = True
            elif ball_x + BALL_RADIUS >= GAME_WIDTH / 2:
                score0 += 1
                scorer = 0
                redis_conn.hset(game_id, 'serve', 1)
                score_flag = True

            if ball_speed <= 110:
                ball_speed += (0.04)
            
            redis_conn.hset(game_id, 'score0', score0)
            redis_conn.hset(game_id, 'score1', score1)

        redis_conn.hset(game_id, 'ball_speed', ball_speed)
        redis_conn.hset(game_id, 'ball_xvec', ball_xvec)
        redis_conn.hset(game_id, 'ball_yvec', ball_yvec)
        redis_conn.hset(game_id, 'ball_x', ball_x)
        redis_conn.hset(game_id, 'ball_y', ball_y)
        redis_conn.hset(game_id, 'bar0_y', bar0_y)
        redis_conn.hset(game_id, 'bar1_y', bar1_y)
        

        async_to_sync(channel_layer.group_send)(
            room_group_name,
            {
                'type': 'objects_position_update',
                'ball_x': ball_x,
                'ball_y': ball_y,
                'bar0_x': BAR0_x,
                'bar0_y': bar0_y,
                'bar1_x': BAR1_x,
                'bar1_y': bar1_y,
            }
        )

        if game_state == "start":
            async_to_sync(channel_layer.group_send)(
                room_group_name,
                {
                    'type': 'game_start',
                }
            )
            redis_conn.hset(game_id, 'game_state', 'playing')
            game_loop.apply_async(args=[room_group_name], countdown=3)
            return
        elif score_flag:
            async_to_sync(channel_layer.group_send)(
                room_group_name,
                {
                    'type': 'score_change',
                    'score0': score0,
                    'score1': score1,
                    'scorer': scorer,
                }
            )
            if score0 >= WINNING_SCORE or score1 >= WINNING_SCORE:
                sleep(3)
                async_to_sync(channel_layer.group_send)(
                    room_group_name,
                    {
                        'type': 'game_over',
                        'winner': 0 if score0 >= WINNING_SCORE else 1
                    }
                )
                redis_conn.hset(game_id, 'game_state', 'end')
                return
            else:
                redis_conn.hset(game_id, 'game_state', 'start')
                game_loop.apply_async(args=[room_group_name], countdown=3)
                return
    except GameSession.DoesNotExist:
        return 
    # 다음 게임 루프 예약 (1/60초 후 실행)
    game_loop.apply_async(args=[room_group_name], countdown=1.0/40.0)
