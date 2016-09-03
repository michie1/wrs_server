let express = require('express');
let router = express.Router();

let redis = require('redis');
let client = redis.createClient();

router.get('/', (req, res) => {
    client.flushdb();

    // races
    client.sadd('races', '2016-08-11:ronde-van-de-lier');
    client.sadd('races', '2016-08-11:gouden-pijl-emmen');

    client.sadd('races:michiel', '2016-08-11:ronde-van-de-lier');
    client.sadd('races:henk', '2016-08-11:gouden-pijl-emmen');

    client.set('race:2016-08-11:ronde-van-de-lier', '{"name": "Ronde van de Lier", "date": "2016-08-11", "category": "criterium", "report": "verslag"}');
    client.set('race:2016-08-11:gouden-pijl-emmen', '{"name": "Gouden Pijl Emmen", "date": "2016-08-11", "category": "criterium", "report": "verslag"}');

    res.json({message: 'success'});
});

module.exports = router;
