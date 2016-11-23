var util = require('util');
var http = require('./http');

function trim (str) {
	return str.replace(/(<([^>]+)>)/ig, '');
}

function get (url) {
	return http.get({
		url: url,
		auth: { bearer: this.access_token }
	})
	.then(trim);
}

class Translator {
	issueToken() {
		return http.post(util.format(process.env.ENDPOINT_ISSUE_TOKEN, process.env.CLIENT_ID))
		.then(function (access_token) {
			this.access_token = access_token;
		}.bind(this));
	}

	detect(msg) {
		var message = encodeURIComponent(msg.body.event.text);
		var detect = util.format(process.env.ENDPOINT_DETECT, message);

		return get(detect.bind(this));
	}

	translate(language, msg) {
		var message = encodeURIComponent(msg.body.event.text);
		var translate = util.format(process.env.ENDPOINT_TRANSLATE, message, process.env.ACCEPTED_LANGUAGE);

		// Is this an acceptable language?
		if (language === process.env.ACCEPTED_LANGUAGE)
			return new Promise(function() {});

		// Since this is not english, we translate
		return get(translate.bind(this));
	}
}

module.exports = Translator;