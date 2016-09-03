let express = require('express');
let router = express.Router();

let redis = require('redis');
let client = redis.createClient();

router.get('/', (req, res) => {
    client.flushdb();

    client.sadd('riders', 'michiel');
    client.sadd('riders', 'henk');

    client.sadd('races', '2016-08-11:ronde-van-de-lier');
    client.sadd('races', '2016-08-11:gouden-pijl-emmen');

    // results
    //client.set('result:michiel:2016-08-11:ronde-van-de-lier', 21);
    client.set('result:henk:2016-08-11:gouden-pijl-emmen', 31);

    //client.sadd('results:michiel', '{"result":"21","race":{"name":"Ronde van de Lier","slug":"ronde-van-de-lier","date":"2016-08-11"}}');
    client.sadd('results:henk', '{"result":"31","race":{"name":"Gouden Pijl Emmen","slug":"gouden-pijl-emmen","date":"2016-08-11"}}');
                
    client.sadd('results:2016-08-11:gouden-pijl-emmen', '{"result":"31","rider":{"name":"Henk","slug":"henk"}}');
    //client.sadd('results:2016-08-11:ronde-van-de-lier', '{"result":"21","rider":{"name":"Michiel","slug":"michiel"}}');

    res.json({message: 'success'});
});

module.exports = router;
