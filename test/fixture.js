let express = require('express');
let router = express.Router();

let redis = require('redis');
let client = redis.createClient();

let api = require('./fixture/api');
let servicesDataRace = require('./fixture/services/data/race');
let servicesDataRider = require('./fixture/services/data/rider');
let servicesDataResult = require('./fixture/services/data/result');

router.use('/api', api);
router.use('/services/data/race', servicesDataRace);
router.use('/services/data/rider', servicesDataRider);
router.use('/services/data/result', servicesDataResult);

module.exports = router;
