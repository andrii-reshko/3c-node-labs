.PHONY: help up down build clean logs ps
.DEFAULT_GOAL := help

help:
	@echo "Available commands:"
	@echo "  up     - Start MongoDB container"
	@echo "  down   - Stop MongoDB container"
	@echo "  build  - Build the Docker image"
	@echo "  clean  - Remove containers and volumes"
	@echo "  logs   - Follow MongoDB logs"
	@echo "  ps     - Check status of containers"

up:
	docker compose up -d

down:
	docker compose down

build:
	docker compose up --build -d

clean:
	docker compose down -v

ps:
	docker compose ps