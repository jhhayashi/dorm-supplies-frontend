const router = require('express').Router();
const request = require('request');
const config = require('../app/models/config');
const testData = require('../app/models/testData');

router.get('/', (req, res, next) => {
    request.get({url: config.apiUrl + '/items'}, function(err, r, items) {
        if (err || r.statusCode != 200)
            return res.render('index', { items: [] });
        else return res.render('index', { items: JSON.parse(items) });
    });
});

// form for adding items
router.get('/items', function(req, res, next) {
    return res.render('items');
});

// example reverse proxy endpoint for form submit
router.post('/items', function(req, res, next) {
    // could do validation here
    
    request.post({
        url: config.apiUrl + '/items',
        form: req.body
    }, function(err, r, body) {
        if (err || r.statusCode !== 200)
            return res.render('items', { error: true });
        else
            return res.render('items', { success: true });
    });
});

module.exports = router;
