"""
ASGI config for config project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/howto/deployment/asgi/
"""

import os

from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator 
from chat.routing import websocket_urlpatterns as chat_websocket_urlpatterns
from pingpong.routing import websocket_urlpatterns as pingpong_websocket_urlpatterns
from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

# application = get_asgi_application()

django_asgi_app = get_asgi_application()
# 클라이언트와 Channels 개발 서버가 연결 될 때, 어느 protocol 타입의 연결인지
websocket_urlpatterns = chat_websocket_urlpatterns + pingpong_websocket_urlpatterns

application = ProtocolTypeRouter({ 
    'http': django_asgi_app,
    'websocket': AllowedHostsOriginValidator(
        AuthMiddlewareStack(URLRouter(websocket_urlpatterns))
    ),
})
