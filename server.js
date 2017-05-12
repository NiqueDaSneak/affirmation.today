"use strict"

// NPM PACKAGES
var express = require('express')
var bodyParser = require('body-parser')
var moment = require('moment')
var request = require('request')
var PAGE_ACCESS_TOKEN = 'EAAFTJz88HJUBAJqx5WkPGiIi0jPRyBXmpuN56vZB0FowKCZCzej8zpM4hKTt2ZCXqDZASqL4GUC5ywuOjakob1icM4Sfa4L3xcpsTKsjHl0QHzPylbHjJakyq1hcPNA4i8wt7XjsGZBGoUNYP7Yx2hg8RYiG9xzUoo0dzuThqGwZDZD'

var mongoose = require('mongoose')
mongoose.connect('mongodb://dom:Losangeleslakers47@ds133961.mlab.com:33961/affirmation-today')
var db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
var affirmationSchema = mongoose.Schema({text: String})
var Affirmation = mongoose.model('Affirmation', affirmationSchema)

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
    Affirmation.find((err, affirmation) => {
        var aff
        if (err) return console.error(err)
        aff = affirmation[Math.floor(Math.random() * affirmation.length)].text
        res.render('homepage', ({date: moment().format("ddd, MMM Do YY"), quote: aff}));
    })
})

// ADMIN APP
app.get('/admin', function(req, res) {
  Affirmation.find((err, affirmation) => {
      if (err) return console.error(err)
      res.render('admin', ({affirmations: affirmation}));
  })
})

app.post('/new_affirmation', function(req, res) {
    var new_affirmation = new Affirmation({
        text: req.body.affirmation_text
    }).save((err, affirmation) => {
       if (err) return console.error(err)
    })
    res.redirect('admin')
})

// FACEBOOK MESSENGER BOT
app.get('/webhook', function(req, res) {
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
    var senderID = event.sender.id;
    var recipientID = event.recipient.id;
    var timeOfMessage = event.timestamp;
    var message = event.message;

    console.log("Received message for user %d and page %d at %d with message:", senderID, recipientID, timeOfMessage);
    console.log(JSON.stringify(message));

    var messageId = message.mid;

    var messageText = message.text;
    var messageAttachments = message.attachments;

    if (messageText) {

        // If we receive a text message, check to see if it matches a keyword
        // and send back the example. Otherwise, just echo the text we received.
        switch (messageText) {
            case 'generic':
                sendGenericMessage(senderID);
                break;

            default:
                sendTextMessage(senderID, messageText);
        }
    } else if (messageAttachments) {
        sendTextMessage(senderID, "Message with attachment received");
    }
}

function sendGenericMessage(recipientId, messageText) {
    // To be expanded in later sections
}

function sendTextMessage(recipientId, messageText) {
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            text: messageText
        }
    };

    callSendAPI(messageData);
}

function callSendAPI(messageData) {
    request({
        uri: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {
            access_token: PAGE_ACCESS_TOKEN
        },
        method: 'POST',
        json: messageData

    }, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            var recipientId = body.recipient_id;
            var messageId = body.message_id;

            console.log("Successfully sent generic message with id %s to recipient %s", messageId, recipientId);
        } else {
            console.error("Unable to send message.");
            console.error(response);
            console.error(error);
        }
    });
}

// HELPER FUNCTIONS

// SERVER LISTENING
var port = process.env.PORT || 3000;
app.listen(port, function() {
    console.log('Server running on port ' + port);
});
app.on('error', function() {
    console.log(error);
});
module.exports = app;
