"use strict"

// NPM PACKAGES
var express = require('express')
var bodyParser = require('body-parser')
var moment = require('moment')
var request = require('request')
var PAGE_ACCESS_TOKEN = 'EAAFTJz88HJUBAJqx5WkPGiIi0jPRyBXmpuN56vZB0FowKCZCzej8zpM4hKTt2ZCXqDZASqL4GUC5ywuOjakob1icM4Sfa4L3xcpsTKsjHl0QHzPylbHjJakyq1hcPNA4i8wt7XjsGZBGoUNYP7Yx2hg8RYiG9xzUoo0dzuThqGwZDZD'

// DATABASE SETUP
var mongoose = require('mongoose')
mongoose.connect('mongodb://dom:Losangeleslakers47@ds133961.mlab.com:33961/affirmation-today')
var db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
var affirmationSchema = mongoose.Schema({text: String})
var Affirmation = mongoose.model('Affirmation', affirmationSchema)

var userSchema = mongoose.Schema({id: Number, fullName: String, photo: String, subscription: {enrolled: Boolean, timezone: Number, timeOfDay: String}})
userSchema.virtual('firstName').get(() => {
    return this.fullName.split(' ')[0]
})
var User = mongoose.model('User', userSchema)

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
        if (err)
            return console.error(err)
        res.render('admin', ({affirmations: affirmation}));
    })
})

app.post('/new_affirmation', function(req, res) {
    var new_affirmation = new Affirmation({text: req.body.affirmation_text}).save((err, affirmation) => {
        if (err)
            return console.error(err)
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
                if (event.message || event.postback) {
                    eventHandler(event)
                } else {
                    console.log("Webhook received unknown event: ", event)
                }
            })
        })
        // Assume all went well.
        //
        // You must send back a 200, within 20 seconds, to let us know
        // you've successfully received the callback. Otherwise, the request
        // will time out and we will keep trying to resend.
        res.sendStatus(200)
    }
})

function eventHandler(event) {
    if (event.postback) {
        var postback = event.postback.payload
        var senderID = event.sender.id
        switch (postback) {
            case 'GET_STARTED_PAYLOAD':
                request({
                    uri: 'https://graph.facebook.com/v2.6/' + senderID + '?access_token=EAAFTJz88HJUBAJqx5WkPGiIi0jPRyBXmpuN56vZB0FowKCZCzej8zpM4hKTt2ZCXqDZASqL4GUC5ywuOjakob1icM4Sfa4L3xcpsTKsjHl0QHzPylbHjJakyq1hcPNA4i8wt7XjsGZBGoUNYP7Yx2hg8RYiG9xzUoo0dzuThqGwZDZD',
                    method: 'GET'
                }, function(error, response, body) {
                    if (error) {
                        return console.error('upload failed:', error);
                    }
                    var data = JSON.parse(body)
                    var newUser = new User({id: senderID, fullName: data.first_name + ' ' + data.last_name, photo: data.profile_pic, subscription: {enrolled: false, timezone: data.timezone}})
                    newUser.save((err, user) => {
                      if (err) return console.error(err)
                      console.log(user)
                    })
                    sendWelcomeMessage(senderID, 'Hello '+ data.first_name +'! Welcome to Affirmation.today! Would you like to sign up for reoccuring messages')
                })
                break
            case 'YES_SCHEDULE_MSG':
                sendTextMessage(senderID, 'What time of day would you like us to send you an affirmation? Respond w/ Morning, Afternoon, or Evening')
                break
            case 'NO_SCHEDULE_MSG':
                sendTextMessage(senderID, 'That is fine! Let us know if you change your mind! In the mean time, here is the affirmation for today!')
                var aff = returnAffirmation()
                sendTextMessage(senderID, aff)
                break
            default:
                console.log(postback)
        }
    }

    if (event.message) {}
}

function returnAffirmation() {
  Affirmation.find((err, affirmation) => {
      var aff
      if (err) return console.error(err)
      aff = affirmation[Math.floor(Math.random() * affirmation.length)].text
      return aff
  })
}

function sendGenericMessage(recipientId, messageText) {
    // To be expanded in later sections
}

function sendWelcomeMessage(recipientId, messageText) {
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            "attachment": {
                "type": "template",
                "payload": {
                    "template_type": "button",
                    "text": messageText,
                    "buttons": [
                        {
                            "type": "postback",
                            "title": "Yes I would",
                            "payload": "YES_SCHEDULE_MSG"
                        }, {
                            "type": "postback",
                            "title": "Not Interested",
                            "payload": "NO_SCHEDULE_MSG"
                        }
                    ]
                }
            }
        }
    }
    callSendAPI(messageData);
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
