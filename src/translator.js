var util = require('util');
var http = require('./http');

function trim (str) {
	return str
		.replace(/(<([^>]+)>)/ig, '');
}

function htmlDecode(input)
{
	return new DOMParser()
		.parseFromString(input, 'text/html')
		.documentElement.textContent;
}

function get (url) {
	return http.get({
		url: url,
		auth: { bearer: this.access_token }
	})
	.then(trim)
	.then(htmlDecode);
}

class Translator {
	issueToken() {
		return http.post(util.format(process.env.ENDPOINT_ISSUE_TOKEN, process.env.CLIENT_ID))
		.then(function (access_token) {
			this.access_token = access_token;
		}.bind(this));
	}

	detect(msg) {
		var message = encodeURIComponent(msg.text);
		var detect = util.format(process.env.ENDPOINT_DETECT, message);

		return get.call(this, detect);
	}

	translate(language, msg) {
		var message = encodeURIComponent(msg.text);
		var translate = util.format(process.env.ENDPOINT_TRANSLATE, message, process.env.ACCEPTED_LANGUAGE);

		// Is this an acceptable language?
		if (language === process.env.ACCEPTED_LANGUAGE)
			return new Promise(function() {});

		// Since this is not english, we translate
		return get.call(this, translate);
	}
}

module.exports = Translator;