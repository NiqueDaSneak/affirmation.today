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
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(express.static('public'));

// VIEWS
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

// LANDING PAGE & MAIN APP
app.get('/', function(req, res) {

    res.render('homepage', ({date: moment().format("ddd, MMM Do YY"), quote: serveAffirmation()}));
});

// FACEBOOK MESSENGER BOT
app.get('/webhook', function(req, res) {
    var accessToken = 'EAAFTJz88HJUBAJqx5WkPGiIi0jPRyBXmpuN56vZB0FowKCZCzej8zpM4hKTt2ZCXqDZASqL4GUC5ywuOjakob1icM4Sfa4L3xcpsTKsjHl0QHzPylbHjJakyq1hcPNA4i8wt7XjsGZBGoUNYP7Yx2hg8RYiG9xzUoo0dzuThqGwZDZD'
    if (req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token'] === 'jai_jai_ganesha') {
        console.log("Validating webhook");
        res.status(200).send(req.query['hub.challenge'])
    } else {
        console.error("Failed validation. Make sure the validation tokens match.")
        res.sendStatus(403)
    }
})

app.post('/webhook', function(req, res) {
    var data = req.body
    // Make sure this is a page subscription
    if (data.object === 'page') {
        // Iterate over each entry - there may be multiple if batched
        data.entry.forEach(function(entry) {
            var pageID = entry.id
            var timeOfEvent = entry.time
            // Iterate over each messaging event
            entry.messaging.forEach(function(event) {
                if (event.message) {
                    receivedMessage(event)
                } else {
                    console.log("Webhook received unknown event: ", event)
                }
            });
        });

        // Assume all went well.
        //
        // You must send back a 200, within 20 seconds, to let us know
        // you've successfully received the callback. Otherwise, the request
        // will time out and we will keep trying to resend.
        res.sendStatus(200)
    }
});

function receivedMessage(event) {
    // Putting a stub for now, we'll expand it in the following steps
    console.log("Message data: ", event.message);
}

    // ADMIN APP
    app.get('/admin', function(req, res) {
        res.render('admin', ({affirmations: db.affirmations.find()}));
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
        var unused = db.affirmations.find({used: false})
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
