FROM python:3.11.9-slim-bookworm

ENV PYTHONUNBUFFERED 1

WORKDIR /app

COPY requirements.txt /app

RUN pip install -r requirements.txt

RUN pip install -U django-eventstream

CMD ["/app/init.sh"]
