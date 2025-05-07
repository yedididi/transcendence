from .models import GameSession
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.http import JsonResponse
from .models import Queue, remoteGameSession
from django_eventstream import send_event
import json

class normalGameView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        game_session = GameSession.objects.create()
        return Response({'game_id': str(game_session.id)}, status=status.HTTP_200_OK)
    
class remoteGameView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        if Queue.objects.filter(user=user).exists():
            return JsonResponse({'error': '이미 대기열에 있습니다.'}, status=status.HTTP_400_BAD_REQUEST)

        Queue.objects.create(user=user)

        if Queue.objects.count() >= 2:
            player1 = Queue.objects.order_by('timestamp').first().user
            player2 = Queue.objects.order_by('timestamp').last().user

            game_session = GameSession.objects.create()
            remote_game_session = remoteGameSession.objects.create(
                player1=player1,
                player2=player2,
                player1_name=player1.username,
                player2_name=player2.username,
                game_session=game_session
            )
            Queue.objects.filter(user__in=[player1, player2]).delete()
            send_event('game-created', 'message', {'game_id': str(game_session.id)})
            return JsonResponse({'game_id': str(game_session.id)}, status=status.HTTP_200_OK)
        else:
            return JsonResponse({'message': '대기열에 추가되었습니다.'})

class remoteCancleView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        try:
            queue_entry = Queue.objects.get(user=user)
            queue_entry.delete()
            return JsonResponse({'message': '대기열에서 제거되었습니다.'}, status=status.HTTP_200_OK)
        except Queue.DoesNotExist:
            return JsonResponse({'error': '대기열에 없습니다.'}, status=status.HTTP_404_NOT_FOUND)
        
