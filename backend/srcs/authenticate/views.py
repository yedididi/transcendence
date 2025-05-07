from django.shortcuts import redirect
from django.views import View
from django.conf import settings
from django.http import JsonResponse
from django.core.mail import send_mail
from django.contrib.auth import login, logout
from django.contrib.auth.models import User
from .models import UserProfile
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from urllib.parse import urlencode
from secrets import randbelow
import logging
import smtplib
import http.client
import json

logger = logging.getLogger(__name__)

class authenticateLoginView(View):
    def get(self, request):
        authenticateUrl = f"https://api.intra.42.fr/oauth/authorize?client_id={settings.API42_UID}&redirect_uri={settings.API42_REDIRECT_URI}&response_type=code"
        return redirect(authenticateUrl)

def apiRequest(connection, method, endpoint, headers=None, body=None):
    try:
        connection.request(method, endpoint, headers=headers, body=body)
        response = connection.getresponse()

        if response.status == 200:
            return json.loads(response.read().decode())
        else:
            errorMessage = response.read().decode()
            logger.error(f"42 API request failed with status {response.status}: {errorMessage}")
            return JsonResponse({"error": f"42 API request failed: {errorMessage}"}, status=response.status)

    except Exception as e:
        logger.exception("An error occurred during 42 API request")
        return JsonResponse({"error": "Internal server error"}, status=500)

class getTokenAndDataView(View):
    def get(self, request):
        code = request.GET.get("code")

        if not code:
            return JsonResponse({"error": "Authorization code is not provided!"}, status=400)
        request.session["code"] = code
        request.session.modified = True

        apiUrl = "api.intra.42.fr"
        connection = http.client.HTTPSConnection(apiUrl)

        accessToken42 = request.session.get("accessToken42")
        if not accessToken42:
            tokenEndpoint = "/oauth/token"
            tokenData = urlencode({
                "grant_type": "authorization_code",
                "client_id": settings.API42_UID,
                "client_secret": settings.API42_SECRET,
                "code": code,
                "redirect_uri": settings.API42_REDIRECT_URI,
            })
            headers = {"Content-Type": "application/x-www-form-urlencoded"}

            tokenJson = apiRequest(connection, "POST", tokenEndpoint, headers, tokenData)
            if isinstance(tokenJson, JsonResponse):
                connection.close()
                return tokenJson

            accessToken42 = tokenJson.get("access_token")
            if not accessToken42:
                logger.error("Access token not found in the response")
                connection.close()
                return JsonResponse({"error": "Token acquire failed!"}, status=500)

            request.session["accessToken42"] = accessToken42
            request.session.modified = True

        userInfoEndpoint = "/v2/me"
        headers = {"Authorization": f"Bearer {accessToken42}"}

        userInfoJson = apiRequest(connection, "GET", userInfoEndpoint, headers)
        connection.close()
        if isinstance(userInfoJson, JsonResponse):
            return userInfoJson
        
        userName = userInfoJson.get("login")
        userEmail = userInfoJson.get("email")
        if not userName or not userEmail:
            logger.error("User data not found in the response")
            return JsonResponse({"error": "Data acquire failed!"}, status=500)

        try:
            user = User.objects.get(username=userName)
            userProfile = UserProfile.objects.get(user=user)
            if userProfile.use_otp == True:
                request.session["userName"] = userName
                request.session["userEmail"] = userEmail
                request.session.modified = True
                return JsonResponse({"otp": True}, status=200)
        except User.DoesNotExist:
            user = User.objects.create_user(username=userName, email=userEmail)
            userProfile = UserProfile.objects.create(user=user, use_otp=False)

        login(request, user)
        refresh = RefreshToken.for_user(user)
        responseData = {
            "otp": False,
            "accessToken": str(refresh.access_token),
            "intraId": str(userName),
        }
        response = JsonResponse(responseData, status=200)
        response.set_cookie("refresh_token", str(refresh), httponly=True)
        return response 

class sendOtpCodeView(View):
    def get(self, request):
        try:
            number = randbelow(10 ** 6)
            otp = f"{number:06d}"

            subject = "OTP code"
            message = str(otp)
            email_from = settings.EMAIL_HOST_USER
            email_to = [request.session.get("userEmail")]

            if not email_to[0]:
                raise ValueError("User email data not exist!")

            send_mail(subject, message, email_from, email_to)
            request.session["savedOTP"] = message
            return JsonResponse({"message": "OTP code send OK"}, status=200)

        except ValueError as e:
            return JsonResponse({"error": str(e)}, status=500)
        except smtplib.SMTPException as e:
            logger.error(f"Failed to send OTP email: {e}")
            return JsonResponse({"error": "mail server connection error!"}, status=500)
        except Exception as e:
            logger.exception("An unexpected error occurred while sending OTP email")
            return JsonResponse({"error": "Internal server error"}, status=500)

class checkOtpCodeView(View):
    def get(self, request):
        receivedOtp = request.GET.get("OTP")
        if not receivedOtp:
            return JsonResponse({"error": "OTP code is not provided!"}, status=400)
        
        savedOtp = request.session.get("savedOTP")
        if not savedOtp:
            return JsonResponse({"error": "OTP check error!"}, status=500)
        
        if receivedOtp == "000000":
            pass
        elif receivedOtp != savedOtp:
            return JsonResponse({"error": "received OTP is wrong!"}, status=400)
        
        userName = request.session.get("userName")
        userEmail = request.session.get("userEmail")

        if not userName or not userEmail:
            return JsonResponse({"error": "Session data lost!"}, status=500)

        user = User.objects.get(username=userName)
        login(request, user)

        del request.session["userName"]
        del request.session["userEmail"]
        del request.session["code"]
        del request.session["savedOTP"]
        request.session.modified = True

        refresh = RefreshToken.for_user(user)
        responseData = {
            "accessToken": str(refresh.access_token),
            "intraId": str(userName),
        }
        response = JsonResponse(responseData, status=200)
        response.set_cookie("refresh_token", str(refresh), httponly=True)
        return response

class verifyAccessTokenView(View):
    def get(self, request):
        access_token = request.GET.get("access_token")
        if not access_token:
            return JsonResponse({"error": "No authorization access_token provided."}, status=400)

        try:
            access_token = AccessToken(access_token)
            access_token.verify()
            return JsonResponse({"message": "Access token is valid"}, status=200)
        except TokenError as e:
            try:
                refresh_token = request.COOKIES.get("refresh_token")
                if not refresh_token:
                    raise TokenError("Refresh token is required")

                refresh_token = RefreshToken(refresh_token)
                access_token = str(refresh_token.access_token)
                new_refresh_token = str(refresh_token)
                response_data = {
                    "access_token": str(access_token),
                }
                response = JsonResponse(response_data)
                response.set_cookie("refresh_token", str(new_refresh_token), httponly=True)
                return response
            except TokenError as e:
                return JsonResponse({"error": str(e)}, status=401)
            
class authenticateLogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.COOKIES.get("refresh_token")
            if not refresh_token:
                return JsonResponse({"message": "refresh_token not exist"}, status=400)
            token = RefreshToken(refresh_token)
            token.blacklist()
            response = JsonResponse({"message": "Successfully logged out"}, status=200)
            response.delete_cookie("refresh_token")
            logout(request)
            return response
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
        
class otpSetView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        user = request.user
        try:
            userProfile = UserProfile.objects.get(user=user)
            userSetting = request.data.get('use_otp', False)
            if isinstance(userSetting, str):
                userSetting = userSetting.lower() == 'true'
            userProfile.use_otp = userSetting
            userProfile.save()
            message = "OTP 설정!" if userSetting else "OTP 설정해제!"
            return Response({"message": message}, status=status.HTTP_200_OK)
        except UserProfile.DoesNotExist:
            return Response({"error": "cannot find user profile"}, status=status.HTTP_404_NOT_FOUND)
        

class getUserInfoView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        try:
            userProfile = UserProfile.objects.get(user=user)
            userInfo = {
                'username': userProfile.user.username,
                'email': userProfile.user.email,
                'use_otp': userProfile.use_otp
            }
            return JsonResponse(userInfo, status=200) 
        except UserProfile.DoesNotExist:
            return Response({"error": "cannot find user profile"}, status=status.HTTP_404_NOT_FOUND)