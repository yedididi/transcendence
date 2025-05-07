import uuid

from django.db import models
from django.contrib.auth.models import User

class GameSession(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, unique=True)
    ball_x = models.FloatField(default=0)
    ball_y = models.FloatField(default=0)
    ball_speed = models.FloatField(default=10)
    ball_xvec = models.FloatField(default=0)
    ball_yvec = models.FloatField(default=0)
    bar0_x = models.FloatField(default=0)
    bar0_y = models.FloatField(default=0)
    bar0_move = models.IntegerField(default=0)
    bar1_x = models.FloatField(default=0)
    bar1_y = models.FloatField(default=0)
    bar1_move = models.IntegerField(default=0)
    score0 = models.IntegerField(default=0)
    score1 = models.IntegerField(default=0)
    serve = models.IntegerField(default=0)
    game_state = models.CharField(default="start")

    def __str__(self):
        return str(self.id)
    

class remoteGameSession(models.Model):
    player1 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='game_rooms_as_player1')
    player2 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='game_rooms_as_player2')
    player1_ready = models.BooleanField(default=False)
    player2_ready = models.BooleanField(default=False)
    player1_name = models.CharField(default="")
    player2_name = models.CharField(default="")
    created_at = models.DateTimeField(auto_now_add=True)
    game_session = models.OneToOneField(GameSession, on_delete=models.CASCADE)

    def __str__(self):
        return f"Game Room ({self.id}): {self.player1} vs {self.player2}"
    
class Queue(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user} - {self.timestamp}"