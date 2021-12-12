VERSION=v1
DOCKERUSER=rgvrme

build:
	docker build -f Dockerfile-client -t signless-client .

push:
	docker tag signless-client $(DOCKERUSER)/signless-client:$(VERSION)
	docker push $(DOCKERUSER)/signless-client:$(VERSION)
	docker tag signless-client $(DOCKERUSER)/signless-client:latest
	docker push $(DOCKERUSER)/signless-client:latest