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

router.post('/buy', (req, res, next) => {
    if (!req.body.id) return res.sendStatus(400);
    request.post({
        url: config.apiUrl + '/items/' + req.body.id,
        headers: { 'x-access-token': req.headers['x-access-token'] },
        form: req.body
    }).pipe(res);
});

router.post('/login', (req, res, next) => {
    request.post(config.apiUrl + '/auth/token', { form: req.body }).pipe(res);
});

router.get('/logout', (req, res, next) => {
    return res.render('logout');
});

router.get('/register', (req, res, next) => {
    return res.render('register');
});

router.post('/register', (req, res, next) => {
    request.post(config.apiUrl + '/users', {form: req.body}).pipe(res);
});

router.get('/admin/items', (req, res, next) => {
    request.get(config.apiUrl + '/items', (err, response, body) => {
        if (!err && response.statusCode == 200)
            return res.render('items', {items: JSON.parse(body)});
        else return res.render('items', {items: []});
    });
});

router.post('/admin/items', (req, res, next) => {
    request.post(config.apiUrl + '/items', {
        headers: { 'x-access-token': req.headers['x-access-token'] },
        form: req.body
    }).pipe(res);
});

router.put('/admin/items', (req, res, next) => {
    request.put(config.apiUrl + '/items/' + req.body.id, {
        headers: { 'x-access-token': req.headers['x-access-token'] },
        form: req.body
    }).pipe(res);
});

router.get('/admin/getitems', (req, res, next) => {
    request.get(config.apiUrl + '/items', {
        headers: { 'x-access-token': req.headers['x-access-token'] }
    }).pipe(res);
});

router.post('/admin/deleteitem', (req, res, next) => {
    if (!req.body.id) return res.sendStatus(400);
    request.delete(config.apiUrl + '/items/' + req.body.id, {
        headers: { 'x-access-token': req.headers['x-access-token'] }
    }).pipe(res);
});

router.post('/admin/makeadmin', (req, res, next) => {
    if (!req.body.id) return res.sendStatus(400);
    request.post(config.apiUrl + '/admins/' + req.body.id, {
        headers: { 'x-access-token': req.headers['x-access-token'] }
    }).pipe(res);
});

router.post('/admin/removeadmin', (req, res, next) => {
    if (!req.body.id) return res.sendStatus(400);
    request.delete(config.apiUrl + '/admins/' + req.body.id, {
        headers: { 'x-access-token': req.headers['x-access-token'] }
    }).pipe(res);
});

router.post('/admin/deleteuser', (req, res, next) => {
    if (!req.body.id) return res.sendStatus(400);
    request.delete(config.apiUrl + '/users/' + req.body.id, {
        headers: { 'x-access-token': req.headers['x-access-token'] }
    }).pipe(res);
});

router.get('/admin/users', (req, res, next) => {
    return res.render('users');
});

router.get('/admin/getusers', (req, res, next) => {
    request.get(config.apiUrl + '/users', {
        headers: { 'x-access-token': req.headers['x-access-token'] }
    }).pipe(res);
});

router.get('/admin/pending', (req, res, next) => {
    return res.render('pending');
});

router.get('/admin/getpending', (req, res, next) => {
    request.get(config.apiUrl + '/users/pending', {
        headers: { 'x-access-token': req.headers['x-access-token'] }
    }).pipe(res);
});

module.exports = router;
