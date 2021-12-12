VERSION=v1
DOCKERUSER=rgvrme

build:
	docker build -f Dockerfile -t signless-worker .
push:
	docker tag signless-worker $(DOCKERUSER)/signless-worker:$(VERSION)
	docker push $(DOCKERUSER)/signless-worker:$(VERSION)
	docker tag signless-worker $(DOCKERUSER)/signless-worker:latest
	docker push $(DOCKERUSER)/signless-worker:latest
