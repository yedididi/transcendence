all : up

up :
	@docker compose -f docker-compose.yaml up -d

down : 
	@docker compose -f docker-compose.yaml down -v --rmi all

clear :
	make down
	docker system prune --volumes --all --force

start : 
	@docker compose -f ./srcs/docker-compose.yaml start

stop : 
	@docker compose -f ./srcs/docker-compose.yaml stop

status : 
	@docker ps

.PHONY: all up down clean start stop status