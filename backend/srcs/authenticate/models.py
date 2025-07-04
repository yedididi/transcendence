from django.db import models
from django.contrib.auth.models import User

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)  
    use_otp = models.BooleanField(default=False)

    def __str__(self):
        return self.user.username