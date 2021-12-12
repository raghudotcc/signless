FROM python:3.8-slim

RUN /usr/local/bin/python3 -m pip install --upgrade pip

RUN pip3 install detoxify pika redis requests jsonpickle Pillow

WORKDIR /srv

COPY  worker-server.py /srv

CMD ["python3", "worker-server.py"]
