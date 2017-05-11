"use strict"

// NPM PACKAGES
var express = require('express');
var db = require('diskdb');
db.connect('db', ['affirmations', 'images']);
var bodyParser = require('body-parser');
var moment = require('moment');

// APP DEFINITIONS
var app = express();

// MIDDLEWARE
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());
app.use(express.static('public'));

// VIEWS
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

// LANDING PAGE & MAIN APP
app.get('/', function(req, res) {

    res.render('homepage', ({
        date: moment().format("ddd, MMM Do YY"),
        quote: serveAffirmation()
    }));
});

// FACEBOOK MESSENGER BOT
app.get('/webhook', function(req, res) {
  if (req.query['hub.mode'] === 'subscribe' &&
      req.query['hub.verify_token'] === 'jai_jai_ganesha') {
    console.log("Validating webhook");
    res.status(200).send(req.query['hub.challenge']);
  } else {
    console.error("Failed validation. Make sure the validation tokens match.");
    res.sendStatus(403);
  }
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
    db.affirmations.save(new_affirmation);
    res.redirect('admin');
});


// HELPER FUNCTIONS
function serveAffirmation() {
    var unused = db.affirmations.find({
        used: false
    })
    return unused[Math.floor(Math.random() * unused.length)].affirmation_text
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
