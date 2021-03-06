'use strict';

const util = require('util');
const express = require('express');
const Slapp = require('slapp');
const Context = require('slapp-context-beepboop');
const Translator = require('./src/translator');

// 
require('dotenv').config();

// use `PORT` env var on Beep Boop - default to 3000 locally
var port = process.env.PORT || 3000;

var slapp = Slapp({
	verify_token: process.env.SLACK_VERIFY_TOKEN,
	context: Context()
});

var translator = new Translator();

slapp.event('message', (payload) => {
	var msg = payload.body.event;
	console.log(msg);

	translator.issueToken()
	.then(function () {
		translator.detect(msg)
		.then(function (language) {
			translator.translate(language, msg)
				.then(function (body) {
					console.log(body);

					return body;
				})
				.then((body) => payload.say(util.format(process.env.RESPONSE, '<@' + msg.user + '>', body)));
		});
	});
});

// attach Slapp to express server
var server = slapp.attachToExpress(express());

// start http server
server.listen(port, (err) => {
	if (err)
		return console.error(err);

	console.log(`Listening on port ${port}`);
});