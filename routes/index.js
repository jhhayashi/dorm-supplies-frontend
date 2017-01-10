const router = require('express').Router();
const request = require('request');
const config = require('../app/models/config');
const testData = require('../app/models/testData');

router.get('/', (req, res, next) => {
    return res.render('index', {items: testData});
});

module.exports = router;
