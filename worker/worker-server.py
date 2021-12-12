#
# Worker server
#
import platform
import os
import pika
from detoxify import Detoxify

hostname = platform.node()
rabbitMQHost = os.getenv("RABBITMQ_HOST") or "localhost"

print(f"Connecting to rabbitmq({rabbitMQHost})") 

def getMQ():
    rabbitMQ = pika.BlockingConnection(
    pika.ConnectionParameters(host=rabbitMQHost, heartbeat=0))
    return rabbitMQ

def callback(ch, method, properties, body):
    print(" [x] Received %r" % body.decode())
    sentence = body.decode()
    result = Detoxify('unbiased').predict(sentence)
    result = str(sentence) + "::" + str(result)
    ch.basic_publish(exchange='', routing_key=properties.reply_to, properties=pika.BasicProperties(correlation_id = properties.correlation_id), body=str(result))
    print("[INFO] Replied on default q with: ", result)
    ch.basic_ack(delivery_tag=method.delivery_tag)

def main():
    rabbitMQ = getMQ()
    rabbitMQChannel = rabbitMQ.channel()
    rabbitMQChannel.basic_qos(prefetch_count=1)
    queue_name = rabbitMQChannel.queue_declare(queue='analyze').method.queue
    rabbitMQChannel.basic_consume(
        queue=queue_name, on_message_callback=callback)
    rabbitMQChannel.start_consuming()
    rabbitMQ.close()

main()
