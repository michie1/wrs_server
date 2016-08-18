let http = require('http');
let redis = require('redis');
let client = redis.createClient();

let server = http.createServer((req, res) => {
    res.writeHead(200);

    if (req.url !== '/favicon.ico') {
        client.get('value', (err, reply) => {
            console.log(reply);
            client.set('value', parseInt(reply) + 1);
        });
    }

    res.end('hello Http');
});
    

client.on('connect', function() {
    console.log('connect');
    client.set('value', 0);
});

server.listen(8080);
