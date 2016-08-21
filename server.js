let http = require('http');
let express = require('express');
let bodyParser = require('body-parser');

let redis = require('redis');
let client = redis.createClient();

let app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(function (req, res, next) {
    // Allow :9000 to request api of this server
    //res.setHeader('Access-Control-Allow-Origin', 'http://localhost:9876');
    //res.setHeader('Access-Control-Allow-Origin', 'http://localhost:9000');
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
});

app.get('/', (req, res) => {
    res.json({message: 'wrs api'});   
});

// Get data of rider/race/result
// @param {string} modelClass The name of the class of the model
// @param {string} slug The slug of a rider/race/result
// @return {Promise} 
// @resolve {object} The data of the rider/race/result
function getData(modelClass, slug) {
    return new Promise((resolve, reject) => {
        client.get(modelClass + ':' + slug, (err, model) => {
            resolve(JSON.parse(model));
        });
    });
}

// Get all riders/races
// @param {string} plural riders/races
// @resolve {object} A list of riders/races
function getAll(modelClassNamePlural, slug) {
    return new Promise((resolve, reject) => {
        let modelClassName = '';
        if (modelClassNamePlural === 'riders') {
            modelClassName= 'rider';
        } else if (modelClassNamePlural === 'races') {
            modelClassName = 'race';
        } else {
            reject();
        }

        let index = modelClassNamePlural;
        if(slug !== undefined) {
            index += ':' + slug;
        }

        // Get set of riders/races
        client.smembers(index, (err, reply) => {
            let p = []; // For each rider/race a promise

            // Get data for each rider/race
            reply.map((slug) => {
                p.push(getData(modelClassName, slug));
            });

            // When all rider/race promises resolved, resolve riders/races
            resolve(Promise.all(p));
        });
    });
}

app.get('/riders', (req, res) => {
    getAll('riders').then(riders => {
        res.json(riders);
    });
});

app.get('/races', (req, res) => {
    getAll('races').then(races => {
        res.json(races);
    });
});

app.get('/riders/:slug', (req, res) => {
    getData('rider', req.params.slug).then(rider => {
        res.json(rider);
    });
});

app.get('/races/:date/:nameSlug', (req, res) => {
    getData('race', req.params.date + ':' + req.params.nameSlug).then(race => {
        res.json(race);
    });
});

app.get('/results/:riderSlug', (req, res) => {
    client.smembers('results:' + req.params.riderSlug, (err, reply) => {
        let results = [];
        reply.map(result => {
            results.push(JSON.parse(result));
        });
        res.json(results);
    });
});

app.get('/results/:date/:raceSlug', (req, res) => {
    client.smembers('results:' + req.params.date + ':' + req.params.raceSlug, (err, reply) => {
        let results = [];
        reply.map(result => {
            results.push(JSON.parse(result));
        });
        res.json(results);
    });
});

app.get('/results/:riderSlug/:raceDate/:raceSlug', (req, res) => {
    getData('result', req.params.riderSlug + ':' + req.params.raceDate + ':' + req.params.raceSlug ).then(result => {
        res.json(result);
    });
});

app.get('/setupTest', (req, res) => {
    client.flushdb();

    // riders
    client.sadd('riders', 'michiel');
    client.sadd('riders', 'henk');

    client.sadd('riders:2016-08-11:ronde-van-de-lier', 'michiel');
    client.sadd('riders:2016-08-11:gouden-pijl-emmen', 'henk');

    client.set('rider:michiel', '{"name": "Michiel"}');
    client.set('rider:henk', '{"name": "Henk"}');

    // races
    client.sadd('races', '2016-08-11:ronde-van-de-lier');
    client.sadd('races', '2016-08-11:gouden-pijl-emmen');
    
    client.sadd('races:michiel', '2016-08-11:ronde-van-de-lier');
    client.sadd('races:henk', '2016-08-11:gouden-pijl-emmen');

    client.set('race:2016-08-11:ronde-van-de-lier', '{"name": "Ronde van de Lier", "date": "2016-08-11", "type": "criterium", "report": "verslag"}');
    client.set('race:2016-08-11:gouden-pijl-emmen', '{"name": "Gouden Pijl Emmen", "date": "2016-08-11", "type": "criterium", "report": "verslag"}');

    // results
    client.set('result:michiel:2016-08-11:ronde-van-de-lier', 12);
    client.set('result:henk:2016-08-11:gouden-pijl-emmen', 31);

    client.sadd('results:michiel', '{"result":"12","race":{"name":"Ronde van de Lier","slug":"ronde-van-de-lier","date":"2016-08-11"}}');
    client.sadd('results:henk', '{"result":"21","race":{"name":"Gouden Pijl Emmen","slug":"gouden-pijl-emmen","date":"2016-08-11"}}');



    res.json({message: 'setupTest'});
});

app.listen(8080);
