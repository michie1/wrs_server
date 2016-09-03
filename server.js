let http = require('http');
let express = require('express');
let bodyParser = require('body-parser');

let redis = require('redis');
let client = redis.createClient();

let app = express();

let fixture = require('./test/fixture');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(function (req, res, next) {
    // Allow :9000 to request api of this server
    //res.setHeader('Access-Control-Allow-Origin', 'http://localhost:9876');
    //res.setHeader('Access-Control-Allow-Origin', 'http://localhost:9000');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
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

app.post('/race', (req, res) => {
    try {
        let slug = req.body.name.replace(' ', '-').toLowerCase();
        let key = req.body.date + ':' + slug;

        client.exists('race:' + key, (err, reply) => {
            if (reply !== 1) { // is new
                client.sadd('races', key);
                client.set('race:' + key, '{"name":"' + req.body.name + '", "date": "' + req.body.date + '", "category": "' + req.body.category + '", "report": "verslag"}');
            }
            // if already exists: do not add, but continue without error.

            res.jsonp({
                message: 'success',
                slug: slug,
                date: req.body.date
            });
        });
    } catch(err) {
        res.jsonp({
            message: 'failure',
        });
    }
});

app.post('/rider', (req, res) => {
    try {
        let slug = req.body.name.replace(' ', '-').toLowerCase();

        client.exists('rider:' + slug, (err, reply) => {
            if (reply !== 1) { // is new
                client.sadd('riders', slug);
                client.set('rider:' + slug, '{"name":"' + req.body.name + '"}');
            }
            // if already exists: do not add, but continue without error.

            res.jsonp({
                message: 'success',
                slug: slug,
            });
        });
    } catch(err) {
        res.jsonp({
            message: 'failure',
        });
    }
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

app.post('/result', (req, res) => {
   
    try {
        // TODO check if race exists
        client.exists('rider:' + req.body.riderSlug, (err, reply) => {
            if (reply === 1) { // rider exists
                //result:henk:2016-08-11
                client.set('result:' + req.body.riderSlug + ':' + req.body.raceDate, req.body.result);

                //results:henk
                client.sadd('results:' + req.body.riderSlug, '{"result":"' + req.body.result + '","race":{"name":"' + req.body.raceName + '","slug":"' + req.body.raceSlug + '","date":"' + req.body.raceDate + '"}}');

                //results:2016-08-11:gouden-pijl-emmen
                client.sadd('results:' + req.body.raceDate + ':' + req.body.raceSlug, '{"result":"' + req.body.result + '","rider":{"name":"' + req.body.riderName + '","slug":"' + req.body.riderSlug + '"}}');

                res.jsonp({
                    message: 'success'
                });
            } else {
                // update?
                //throw "rider does not exist";
                res.jsonp({
                    message: 'rider does not exist.',
                });
            }
        });
    } catch(err) {
        res.jsonp({
            message: 'failure',
        });
    }
});

app.use('/fixture', fixture);

app.listen(8080);
