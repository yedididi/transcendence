FROM nginx:latest

RUN openssl req -x509 -days 365 -nodes -newkey rsa:4096 -sha256 -keyout /etc/ssl/private/pingpong.key -out /etc/ssl/certs/pingpong.crt -subj "/CN=pingpong.42.kr"

COPY conf/default.conf /etc/nginx/conf.d/default.conf

CMD ["nginx", "-g", "daemon off;"]
