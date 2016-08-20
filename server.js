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

// Get data of rider/race
// @param {string} slug The slug of a rider/race
// @return {Promise} 
// @resolve {object} The data of the rider/race
function getData(modelName, slug) {
    return new Promise((resolve, reject) => {
        client.get(modelName + ':' + slug, (err, model) => {
            resolve(JSON.parse(model));
        });
    });
}

// Get all riders/races
// @param {string} plural riders/races
// @param {string} singular rider/race
// @resolve {object} A list of riders/races
function getAll(plural, singular) {
    return new Promise((resolve, reject) => {
        // Get set of riders/races
        client.smembers(plural, (err, pluralReply) => {
            let p = []; // For each rider/race a promise

            // Get data for each rider/race
            pluralReply.map((slug) => {
                p.push(getData(singular, slug));
            });

            // When all rider/race promises resolved, resolve riders/races
            resolve(Promise.all(p));
        });
    });
}

app.get('/riders', function(req, res) {
    getAll('riders', 'rider').then(riders => {
        res.json(riders);
    });
});

app.get('/races', function(req, res) {
    getAll('races', 'race').then(races => {
        res.json(races);
    });
});

app.get('/setup', (req, res) => {
    // riders
    client.sadd('riders', 'michiel');
    client.sadd('riders', 'henk');

    client.sadd('riders:2016-08-11-ronde-van-de-lier', 'michiel');
    client.sadd('riders:2016-08-11-gouden-pijl-emmen', 'henk');

    client.set('rider:michiel', '{"name": "Michiel"}');
    client.set('rider:henk', '{"name": "Henk"}');

    // races
    client.sadd('races', '2016-08-11-ronde-van-de-lier');
    client.sadd('races', '2016-08-11-gouden-pijl-emmen');
    
    client.sadd('races:michiel', '2016-08-11-ronde-van-de-lier');
    client.sadd('races:henk', '2016-08-11-gouden-pijl-emmen');

    client.set('race:2016-08-11-ronde-van-de-lier', '{"name": "Ronde van de Lier", "date": "2016-08-11", "type": "criterium", "report": "verslag"}');
    client.set('race:2016-08-11-gouden-pijl-emmen', '{"name": "Gouden Pijl Emmen", "date": "2016-08-11", "type": "criterium", "report": "verslag"}');

    // results
    client.set('result:michiel:2016-08-11-ronde-van-de-lier', 12);
    client.set('result:henk:2016-08-11-gouden-pijl-emmen', 31);

    res.json({message: 'setup'});
});

app.listen(8080);
