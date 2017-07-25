let httpUtil  = require('./httpUtil');

class CrashkenClient {

	constructor(apiKey, deviceId, _desiredCapabilities, _httpOpts){
		this.sessionId = null;
		this.apiKey = apiKey;
		this.deviceId = deviceId;
		this.desiredCapabilities = _desiredCapabilities;

		this.httpOpts = {
			hostname: 'http://127.0.0.1',
			port: 80,
			delay: 300,
		};

		if(_httpOpts){
			Object.keys(_httpOpts).forEach((k) => {
				this.httpOpts[k] = _httpOpts[k];
			});
		}
	}

	connect(cb){
		let capabilities = {
		  desiredCapabilities:{
		  	"apiKey": this.apiKey,
		  	"deviceId":this.deviceId,
		  }
		};

		Object.keys(this.desiredCapabilities).forEach((k) => {
			capabilities.desiredCapabilities[k] = this.desiredCapabilities[k];
		});

		console.log(capabilities);


		if(this.executionName){
			capabilities.desiredCapabilities.executionName = this.executionName;
		}

		httpUtil(`/api/mobile/wd/hub/session`,'POST',capabilities,this.httpOpts,(res) => {

			if(res.httpStatus != 200){
				return cb(Error("Failed to start session: "+JSON.stringify(res)));
			}
			let response = JSON.parse(res.httpOutput);
			this.sessionId = response.sessionId;
			cb(null,response);
		});
	}

	disconnect(cb){
		httpUtil(`/api/mobile/wd/hub/session/${this.sessionId}`,'DELETE',{},this.httpOpts,(res) =>{
			if(res.httpStatus != 200){
				return cb(new Error(JSON.stringify(res)), JSON.parse(res.httpOutput));
			}
			return cb(null, JSON.parse(res.httpOutput));
		});
	}

	setExecutionName(executionName){
		if(!this.sessionId){
			this.executionName = executionName;
		}else{
			throw new Error('You must set the execution name before connect com Crashken');
		}
	}

	setExecutionGroup(stack, cb){
		if(!this.sessionId){
			throw new Error('You must connect before set the execution group');
		}else{
			httpUtil(`/api/mobile/reporter/${this.sessionId}/execution-group`,'POST',{stack: stack},this.httpOpts,(res) => {
				if(res.httpStatus != 200){
					return cb(Error("Failed to set execution group: "+JSON.stringify(res)));
				}
				let response = JSON.parse(res.httpOutput);
				cb();
			});
		}
	}
}

module.exports = CrashkenClient;
