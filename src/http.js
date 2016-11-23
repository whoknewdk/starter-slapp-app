const request = require('request-promise');

function error (err) {
	console.log(err);
}

module.exports = {
	get: function (options) {
		return request.get(options)
		.catch(error);
	},
	post: function (url) {
		return request.post(url)
		.catch(error);
	}
};