// content of index.js
const Web3 = require('web3');
const http = require('http')
const port = 3000
const web3port = 8544

const web3 = new Web3(new Web3.providers.HttpProvider(`http://node:` + web3port));
const maxDelta = 60 * 2 + 30;

console.log('Connecter to node', web3.isConnected());

function timestamp() {
    return Math.floor(new Date() / 1000);
}

const countdown = (function () {
    const pad = t => {
        return (t + '').length < 2 ? pad('0' + t + '') : t ;
    }
    return s => {

        const d = Math.floor(s / (3600 * 24));

        s  -= d * 3600 * 24;

        const h   = Math.floor(s / 3600);

        s  -= h * 3600;

        const m = Math.floor(s / 60);

        s  -= m * 60;

        const tmp = [];

        (d) && tmp.push(d + 'd');

        (d || h) && tmp.push(h + 'h');

        (d || h || m) && tmp.push(m + 'm');

        tmp.push(s + 's');

        return tmp.join(' ');
    }
}());

const requestHandler = (request, response) => {
    web3.eth.getBlockNumber((err, blockNumber) => {
        web3.eth.getBlock(blockNumber, (err, block) => {
            try {
                const delta = timestamp() - block.timestamp;
                response.statusCode = delta < maxDelta ? 200 : 400;
                console.log(response.statusCode, blockNumber, timestamp(), block.timestamp, delta, countdown(delta));
                response.end('');
            } catch (err) {
                console.log('Error', err);
                response.statusCode = 500;
                response.end('');
            }
        });
    });
}

const server = http.createServer(requestHandler)

server.listen(port, (err) => {
  if (err) {
    return console.log('something bad happened', err)
  }

  console.log(`server is listening on ${port}`)
})

