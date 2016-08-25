let express = require('express');
let router = express.Router();

let redis = require('redis');
let client = redis.createClient();

router.get('/', (req, res) => {
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

module.exports = router;
