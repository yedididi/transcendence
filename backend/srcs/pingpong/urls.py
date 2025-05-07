from django.urls import path, include
from . import views
import django_eventstream


urlpatterns = [
	path('normal/', views.normalGameView.as_view(), name='normalGame'),
	path('remote/', views.remoteGameView.as_view(), name='remoteGame'),
	path('remoteCancle/', views.remoteCancleView.as_view(), name='remoteCancle'),
	path('remoteEvents/', include(django_eventstream.urls), {"channels": ["game-created"]}),
]