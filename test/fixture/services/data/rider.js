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

    res.json({message: 'success'});
});

module.exports = router;
