const request = require('request-promise');
var util = require('util');

function error (err) {
	console.log(err);
}

function trim (str) {
	return str.replace(/(<([^>]+)>)/ig, '');
}

class Translator {
	constructor() {
		
	}

	issueToken() {
		return request.post(util.format(process.env.ENDPOINT_ISSUE_TOKEN, process.env.CLIENT_ID))
		.catch(error)
		.then(function (access_token) {
			this.access_token = access_token;
		}.bind(this));
	}

	detect(msg) {
		var message = encodeURIComponent(msg.body.event.text);
		var detect = util.format(process.env.ENDPOINT_DETECT, message);

		return request.get({
			url: detect,
			auth: { bearer: this.access_token }
		})
		.catch(error)
		.then(trim);
	}

	translate(language, msg) {
		var message = encodeURIComponent(msg.body.event.text);
		var translate = util.format(process.env.ENDPOINT_TRANSLATE, message, process.env.ACCEPTED_LANGUAGE);

		// Is this an acceptable language?
		if (language === process.env.ACCEPTED_LANGUAGE) {
			return new Promise(function() {});
		}

		// Since this is not english, we translate
		return request.get({
			url: translate,
			auth: { bearer: this.access_token }
		})
		.catch(error)
		.then(trim);
	}
}

module.exports = Translator;