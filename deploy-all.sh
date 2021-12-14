#!/bin/sh
kubectl apply -f rabbitmq/rabbitmq-deployment.yaml
kubectl apply -f rabbitmq/rabbitmq-service.yaml

kubectl apply -f mongo/mongo-deployment.yaml
kubectl apply -f mongo/mongo-service.yaml

kubectl apply -f rest/rest-deployment.yaml
kubectl apply -f rest/rest-service.yaml

kubectl apply -f worker/worker-deployment.yaml

kubectl apply -f rest/rest-ingress.yaml

kubectl port-forward --address 0.0.0.0 service/rabbitmq 5672:5672 &
kubectl port-forward --address 0.0.0.0 services/mongo 27017:27017 &
