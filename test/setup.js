let express = require('express');
let router = express.Router();

let redis = require('redis');
let client = redis.createClient();

let api = require('./fixture_api');

router.use('/api', api);

module.exports = router;
