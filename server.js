"use strict"

// NPM PACKAGES
var express = require('express');
var request = require('request');
var logger = require('morgan');
var db = require('diskdb');
db.connect('db', ['affirmations', 'images']);
var bodyParser = require('body-parser');
var moment = require('moment');
var device = require('express-device');



// APP DEFINITIONS
var app = express();
app.locals.testing = "It worked!";

// MIDDLEWARE
app.use(logger('short'));
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(device.capture());

// VIEWS
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

// LANDING PAGE & MAIN APP
app.get('/', function(req, res) {
    res.render('homepage', ({
        date: moment().format("ddd, MMM Do YY"),
        quote: serveAffirmation(),
        image_path: getBackgroundImage(req.device.type)
    }));
});

// ADMIN APP
app.get('/admin', function(req, res) {
    res.render('admin', ({
        affirmations: db.affirmations.find()
    }));
});

app.post('/new_affirmation', function(req, res) {
    var new_affirmation = {
        used: false,
        affirmation_text: req.body.affirmation_text
    }
    db.affirmations.save(new_affirmation)
    res.redirect('admin');
});

app.post('/new_image', function(req, res) {
    var new_image = {
        type: req.body.device,
        link: req.body.image_link
    }
    db.images.save(new_image)
    res.redirect('admin');
});

// HELPER FUNCTIONS
function serveAffirmation() {
    var unused = db.affirmations.find({
        used: false
    })
    return unused[Math.floor(Math.random() * unused.length)].affirmation_text
}
function getBackgroundImage(device_type) {
    var image_pool = db.images.find({
        type: device_type
    })
    return image_pool[Math.floor(Math.random() * image_pool.length)].link
}

// SERVER LISTENING
var port = process.env.PORT || 3000;
app.listen(port, function() {
    console.log('Server running on port ' + port);
});
app.on('error', function() {
    console.log(error);
});
module.exports = app;
