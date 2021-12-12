VERSION=v1
DOCKERUSER=rgvrme

build:
	docker build -f Dockerfile -t signless-rest .

push:
	docker tag signless-rest $(DOCKERUSER)/signless-rest:$(VERSION)
	docker push $(DOCKERUSER)/signless-rest:$(VERSION)
	docker tag signless-rest $(DOCKERUSER)/signless-rest:latest
	docker push $(DOCKERUSER)/signless-rest:latest