const fetcher = require('./dataFetcher')();

module.exports = function(config) {

    let {channel, queueName} = config;

    channel.assertQueue(queueName, {
        durable: true
    });

    channel.prefetch(50);
    channel.consume(queueName, async (message) => {

        // console.log(message.content.toString());

        let { responseQueue, username, id } = JSON.parse(message.content.toString());
        let userDetails = await fetcher.fetchUser(username).catch((err) => { throw err; });

        let data = { userDetails, id };

        channel.sendToQueue(responseQueue, Buffer.from(JSON.stringify(data)), {
            persistent: true
        });

        channel.ack(message);
        
    }, { noAck: false });

};