const express = require('express');
const http = require('http');
const cluster = require('cluster');

let mqUtils = require('./utils/rabbitmq')();
let userRoute = require('./routes/user')

const workerNodes = process.env.CLIENT_NODES_COUNT ? process.env.CLIENT_NODES_COUNT : 3;

if (cluster.isMaster) {

    process.stdout.write(`Master ${process.pid} is running \n`);

    for (let i = 1; i < workerNodes; ++i) {
        cluster.fork();
    }


    cluster.on('exit', (worker, code, signal) => {
        process.stdout.write(`Worker ${process.pid} exited \n`);
    });
}
else {

    process.stdout.write(`Worker ${process.pid} is running \n`);

    let app = express();
    let server = http.createServer(app);

    // app.use('/', express.static());

    app.get('/', (req, res) => {
        res.send('Welcome');
    });

    

    (async function () {

        let oChannel = await mqUtils.getChannel().catch((err) => { throw err; });

        let config = {
            queueName: 'requestQueue',
            channel: oChannel,
            responseQueue: `${process.pid}Response`
        };

        await mqUtils.createQueue(config.queueName, config.responseQueue);
        app.use('/user', userRoute(config));
        server.listen(8080);

    })();

}


