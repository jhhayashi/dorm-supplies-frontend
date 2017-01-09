const router = require('express').Router();
const request = require('request');
const config = require('../app/models/config');

router.get('/', (req, res, next) => {
    request.get(config.apiUrl + '/items', (err, response, body) => {
        if (!err && response.statusCode == 200)
            return res.render('index', {items: JSON.parse(body)});
        else return res.render('index', {items: []});
    });
});

module.exports = router;
