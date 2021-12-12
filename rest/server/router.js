const express = require("express");
const router = express.Router();
const PostDBModel = require("./db");
var amqp = require("amqplib/callback_api");
const rabbitMQHost = process.env.RABBITMQ_HOST || "amqp://localhost";

router.get("/", (request, response) => {
  response.send("Hello World!");
});

router.post("/publish", (request, response) => {
  const data = request.body;
  console.log(data);

  const post = new PostDBModel(data);
  post.save((error) => {
    if (error) {
      response.status(500).json({ msg: "Internal Server Error" });
      return;
    }
    return response.status(200).json({ msg: "Published!!!" });
  });
});

router.get("/all", (request, response) => {
  PostDBModel.find({}, (err, posts) => {
    if (err) {
      response.status(500).send(err);
    } else {
      response.send(posts);
    }
  });
})

router.post("/analyze", (request, response) => {
  const data = request.body;
  const content = data.content;

  function generateUuid() {
    return Math.random().toString() +
      Math.random().toString() +
      Math.random().toString();
  }

  amqp.connect(rabbitMQHost, function (error0, connection) {
    if (error0) {
      throw error0;
    }
    connection.createChannel(function (error1, channel) {
      if (error1) {
        throw error1;
      }
      channel.assertQueue('', {
        exclusive: true
      }, function (error2, q) {
        if (error2) {
          throw error2;
        }

        var correlationId = generateUuid();
        channel.consume(
          q.queue,
          function (msg) {
            if ((msg.properties.correlationId) === correlationId) {
              console.log(" [.] Got %s", msg.content.toString());
              setTimeout(function () {
                return response.send(msg.content.toString());
                connection.close();
              }, 500);
            }
          },
          {
            noAck: true,
          }
        );

        channel.sendToQueue("analyze", Buffer.from(content), {
          correlationId: correlationId,
          replyTo: q.queue,
        });
        console.log(" [x] Sent %s", content);
      });
  });
})


  
});

router.get("/related", (request, response) => {
  return response.send("related");
});

module.exports = router;
