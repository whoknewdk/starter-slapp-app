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

slapp.event('message', (msg) => {
	translator.issueToken();

	translator
		.detect(msg)
		.then(function (language) {
			translator
				.translate(language, msg)
				.then((body) => msg.say(util.format(process.env.RESPONSE, '@jtn', body)));
		});
});

// attach Slapp to express server
var server = slapp.attachToExpress(express());

// start http server
server.listen(port, (err) => {
	if (err) {
		return console.error(err);
	}

	console.log(`Listening on port ${port}`);
});