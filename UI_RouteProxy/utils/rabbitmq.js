const amqp = require('amqplib');

module.exports = function() {
    
    let oChannel = null,
        oConnection = null;

    return {

        getChannel: async function() {

            if (oChannel != null) {
                return oChannel;
            }

            oConnection = await amqp.connect('amqp://localhost').catch((err) => { throw err; });
            oChannel = await oConnection.createChannel().catch((err) => {throw err; });
            return oChannel;

        },

        createQueue: async function(queueName, responseQueueName) {
            
            if (oChannel == null) {
                throw err;
            }

            await oChannel.assertQueue(queueName, {
                durable: true
            });

            await oChannel.assertQueue(responseQueueName, {
                durable: true
            });

        }
    };

};