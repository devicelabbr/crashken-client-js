const http = require("http");
const util = require('util');

module.exports = (path, method, data, httpOpts, callback) => {

	let requestObj = Object.assign({
		path: path,
		method: method
	},httpOpts);

	if(method === 'POST'){
		requestObj.headers = {
	    'Content-Type': 'application/json',
	    'Content-Length': Buffer.byteLength(JSON.stringify(data))
	  }
	}

	let req = http.request(requestObj, (res) => {

		let response = '';
		res.setEncoding('utf8');
		res.on('data', (chunk) => {
			response += chunk;
		});
		res.on('end', () => {
			callback({
				httpStatus: res.statusCode,
				httpOutput: response
			});
		});
	});

	req.on('error', (e) => {
		console.error(`problem with request: ${e.message}`);
		console.log(e.stack);
		if(e.message.indexOf('ENOTFOUND') > -1){
			throw new Error(`Failed to connect on Crashken Server (http://${httpOpts.host}:${httpOpts.port}), verify if the information is correct.`);
		}else{
			throw e;
		}
	});

	if (method == 'POST') {
		req.write(JSON.stringify(data));
	}

	req.end();
}
