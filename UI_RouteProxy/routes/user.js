const express = require('express');
const uuid4 = require('uuid').v4;
let router = express.Router();
const EventEmitter = require('events');
let emitter = new EventEmitter();

module.exports = function(options) {

    let mqChannel = options.channel;
    let { queueName, responseQueue } = options;

    if (mqChannel == null) {
        throw err;
    }

    (function(){
        mqChannel.consume(responseQueue, (message) => {

            let { userDetails, id } = JSON.parse(message.content.toString());
            // process.stdout.write(`Received response for ${id}\n`);
            // console.log(userDetails);
            emitter.emit(id, userDetails);
            mqChannel.ack(message);

        }, { noAck: false });
    })();
    

    router.get('/:username', (req, res) => {       
        
        let username = req.params.username;
        let id = uuid4();
        let data = { username, id, responseQueue };

        emitter.once(id, (userDetails) => {
            res.send(userDetails);
            res.end();
        });
        
        // process.stdout.write(`Send request for ${id} ${username}\n`);
        mqChannel.sendToQueue(queueName, Buffer.from(JSON.stringify(data)), {
            persistent: true
        });

        // res.send(username);

    });

    return router;

};

