let mqUtils = require('./utils/rabbitmq')();
let consumer = require('./services/consumer');
let fetcher = require('./services/dataFetcher');
const cluster = require('cluster');

const workerNodes = process.env.PROCESSING_NODES_COUNT ? process.env.PROCESSING_NODES_COUNT : 3;

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

    (async function(){
    
        let channel = await mqUtils.getChannel();
    
        let config = { channel, queueName: 'requestQueue' };
    
        consumer(config);
    
        // let details = await fetcher().fetchUser('antirez');
        // console.log(details);
    
        // details = await fetcher().fetchUser('hello');
        // console.log(details);
    
    })();

}