let http = require('http');
let express = require('express');
let bodyParser = require('body-parser');

let redis = require('redis');
let client = redis.createClient();

let app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', function(req, res) {
    res.json({ message: 'hooray! welcome to our api!' });   
});

// Get rider data 
// @param {string} riderSlug The slug of a rider
// @return {Promise} 
// @resolve {object} The data of the rider
function getRider(riderSlug) {
    return new Promise((resolve, reject) => {
        client.get('rider:' + riderSlug, (err, rider) => {
            resolve(JSON.parse(rider));
        });
    });
}

app.get('/riders', function(req, res) {
    // Get set of riders
    client.smembers('riders', (err, ridersReply) => {
        let p = []; // For each rider a promise

        // Get rider data for each rider
        ridersReply.map((riderSlug) => {
            p.push(getRider(riderSlug));
        });

        // When all promises resolved, output data
        Promise.all(p).then(riders => {
            res.json(riders);
        });
    });
});


app.get('/setup', (req, res) => {
    // riders
    client.sadd('riders', 'michiel');
    client.sadd('riders', 'henk');

    client.set('rider:michiel', '{"name": "Michiel"}');
    client.set('rider:henk', '{"name": "Henk"}');


    res.json({message: 'setup'});
});

app.listen(8080);
