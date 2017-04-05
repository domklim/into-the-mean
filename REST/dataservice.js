exports.update = (model, reqBody, res) => {
	var devId = reqBody.deviceId;
	if(!devId){
		res.writeHead(400,{
			'content-type': 'text/plain'
			});
		res.end('Bad Request');
	} else {
	model.findOne({deviceId : devId}, (err, data) => {
		if(err){
			console.log(err);
			if(res != null){
				res.writeHead(500, {
					'content-type': 'text/plain'
				});
				res.end('Internal server error');
			}
				return;
		} else {
			var device = toDevice(reqBody, model);
			if(!data){
				device.save((err) => {
					if(!err){
						device.save();
					}
				});
				if(res != null){
					res.writeHead(201, {
						'content-type': 'text/plain'
					});
					res.end('Device created');
				}
				return;
			}

			data.deviceId = device.deviceId;
			data.status = device.status;

			data.save((err) => {
				if(!err){
					console.log('Device id ', devId, ' successfully updated')
					data.save();
				} else {
					console.log('Error on save ', err);
				}
			});

			if(res != null){
				res.writeHead(200, {
					'content-type': 'text/plain'
				});
				res.end('Device id ' + devId + ' successfully updated.')
			}

		}

	});
    }
}

function toDevice(body, Device){
	return new Device({
		deviceId: body.deviceId,
		status: body.status
	});
}

exports.findById = (model, _deviceId, res) => {
	model.findOne({deviceId: _deviceId}, (err,result) => {
		if(err){
			console.log('error', err);
			res.writeHead(500, {
				'content-type': 'text/plain'
			});
			res.end('Internal server error');
		} else {
			if(!result){
				if(res != null){
					res.writeHead(404, {
						'content-type': 'text/plain'
					});
					res.end('Not found');
				}
				return;
			}
			if(res != null){
				res.setHeader('content-type','application/json');
				res.send(result);
			}
			console.log(result);
		}
	});
}

exports.list = (model, res) => {
	model.find({}, (err, result) => {
		if(err){
			console.log(err);
			return null;
		}
		if(res != null){
			res.writeHead(200, {
				'content-type': 'application/json'
			});
			res.end(JSON.stringify(result));
		}
		return JSON.stringify(result);
	});
}
