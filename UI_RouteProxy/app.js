const express = require('express');
const http = require('http');
const cluster = require('cluster');

let mqUtils = require('./utils/rabbitmq')();
let userRoute = require('./routes/user')

const workerNodes = process.env.NODESCOUNT ? process.env.NODESCOUNT : 2;

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
        await mqUtils.createQueue();
        app.use('/user', userRoute({channel: oChannel}));
        server.listen(8080);
    })();

}


