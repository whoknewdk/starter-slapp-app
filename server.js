'use strict'

const express = require('express')
const request = require('request-promise')
const Slapp = require('slapp')
const Context = require('slapp-context-beepboop')

// 
require('dotenv').config();

// use `PORT` env var on Beep Boop - default to 3000 locally
var port = process.env.PORT || 3000

var slapp = Slapp({
  verify_token: process.env.SLACK_VERIFY_TOKEN,
  context: Context()
})

// Issue microsoft token
request.post({
  url: process.env.ENDPOINT_ISSUE_TOKEN + `?Subscription-Key=${process.env.CLIENT_ID}`
})
.then(listen)
.catch(error);

function listen (access_token) {
  slapp.event('message', (msg) => {
    var message = encodeURIComponent(msg.body.event.text);

    var translate = process.env.ENDPOINT_TRANSLATE + `?text=${message}&to=en`;
    var detect = process.env.ENDPOINT_DETECT + `?text=${message}`;

    // Detect language
    request.get({
      url: detect,
      auth: { bearer: access_token }
    })
    .then(trim)
    .then(function (language) {
      // Is this an acceptable language?
      if (language === process.env.ACCEPTED_LANGUAGE)
        return;

      // Since this is not english, we translate
      request.get({
        url: translate,
        auth: { bearer: access_token }
      })
      .then(trim)
      .then((body) => msg.say(util.format(process.env.RESPONSE, '@jtn2', body)))
      .catch(error)
    })
    .catch(error)
  })
}

function trim (str) {
  return str.replace(/(<([^>]+)>)/ig, '');
}

function error (err) {
  console.log(err)
}

// attach Slapp to express server
var server = slapp.attachToExpress(express())

// start http server
server.listen(port, (err) => {
  if (err) {
    return console.error(err)
  }

  console.log(`Listening on port ${port}`)
})
