
exports.update = (model, reqBody, res) => {
	let userId = reqBody.username;
	let pw = reqBody.password;
	let admin = reqBody.admin;  

	if(!userId){
		res.writeHead(400, {
			'content-type': 'text/plain'
		});
		res.end('Bad request')
	} else {
		model.findOne({username: userId, password: pw, admin: admin },
		 (err, data) =>{
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
				let user = toUser(reqBody, model);
				if(!data){
					user.save((err) => {
						if(!err){
							user.save();
						}
					});
					if(res != null){
						res.writeHead(201, {
							'content-type': 'text/plain'
						});
						res.end('Created');
					}
					return;
				}

				data.username = user.username;
				data.password = user.password;
				data.admin = user.admin;

				data.save((err) =>{
					if(!err){
						data.save();
					} else{
					    console.log('Error on save', err);
					}
				});

				if(res != null) {
					res.writeHead(200, {
						'content-type': 'text/plain'
					});
					res.end('User ' + userId + ' updated!')
				}
			}
		});
	}
}

exports.remove = (model, _user, res) => {
	console.log('Removing ', _user);
	let user = _user.username;
	model.findOne({username: user}, (err, data) => {
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
			if(!data){
				console.log(_user, ' not found');
				if(res != null) {
					res.writeHead(404, {
						'content-type': 'text/plain'
					});
					res.end('Not found')
				}
				return;
			} else {
				data.remove((err) => {
					if(!err){
						data.remove();
					} else {
						console.log(err);
					}
				});
				if(res != null){
					res.writeHead(200, {
						'content-type': 'text/plain'
					});
					res.end('Deleted');
				}
				return;
			}
		}
	});

}

exports.list = (model, res) => {
	model.find({}, (err, users) => {
		if(err) {
			console.log(err);
			return null;
		}
		let usersArray = [];
		for(let user of users){
			usersArray.push(user.username);
		}
		if(res != null){
		    res.writeHead(200, {
			    'content-type': 'text/plain'
		    });
		    res.end(JSON.stringify(usersArray));
	    }
	});
}

function toUser(body, User){
	return new User({
		username: body.username,
		password: body.password,
		admin: body.admin,
	});
}
