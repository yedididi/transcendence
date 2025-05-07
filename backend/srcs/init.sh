#!/bin/sh

sleep 10

python3 manage.py makemigrations
python3 manage.py migrate

celery -A config worker -l info &
exec python3 manage.py runserver 0.0.0.0:8000