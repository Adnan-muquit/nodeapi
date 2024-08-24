// cluster.js
const cluster = require('cluster');
const os = require('os');
const numCPUs = 2; // Set the number of worker processes to 2

if (cluster.isMaster) {
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }
    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died. Forking a new worker.`);
        cluster.fork();
    });
} else {
    require('./server');
}
