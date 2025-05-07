from django.urls import path
from . import views

urlpatterns = [
	path('login/', views.authenticateLoginView.as_view(), name='authenticateLogin'),
	path('getTokenAndData/', views.getTokenAndDataView.as_view(), name='getTokenAndData'),
	path('sendOtpCode/', views.sendOtpCodeView.as_view(), name='sendOtpCode'),
	path('checkOtpCode/', views.checkOtpCodeView.as_view(), name='checkOtpCode'),
	path('verifyAccessToken/', views.verifyAccessTokenView.as_view(), name='verifyAccessToken'),
	path('logout/', views.authenticateLogoutView.as_view(), name='authenticateLogout'),
	path('otpSet/', views.otpSetView.as_view(), name='otpSet'),
	path('getUserInfo/', views.getUserInfoView.as_view(), name='getUserInfo'),
]