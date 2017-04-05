var	express = require('express')
	, http = require('http')
	, path = require('path')
	, bodyParser = require('body-parser')
	, logger = require('morgan')
	, methodOverride = require('method-override')
	, errorHandler = require('errorhandler')
	, mongoose = require('mongoose')
	, dataservice = require('./dataservice')
	, url = require('url')
	, cors = require('cors')
	, jwt = require('jsonwebtoken')
	, userService = require('./userdata')
	, mqtt = require('mqtt')
	, cfg = require('./conf');

var apiRoutes = express.Router();

var client = mqtt.connect('mqtt://test.mosquitto.org');

client.subscribe('xxx/yyy');

client.on('connect', () => {
	console.log('Connected to Mqtt ...');
});

client.on('message', (topic, msg, packet) => {
	 if(topic == 'xxx/yyy'){
		console.log('MQTT topic: ', topic);
		console.log(' payload ', packet.payload.toString());
	 }
})

var app = express();
app.set('port', process.env.PORT || 3000);
app.set('superSecret', cfg.secret);
app.use(methodOverride());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cors());
app.use(logger('dev'));
app.use('/api', apiRoutes);

const forceSSL = () => {
  return (req, res, next) => {
    if (req.headers['x-forwarded-proto'] !== 'https') {
      return res.redirect(['https://', req.get('Host'), req.url].join(''));
    }
    next();
  }
}

app.use(forceSSL());
app.use(express.static(__dirname + '/dist'));

if('development' == app.get('env')){
	app.use(errorHandler());
}

var dbUsers = mongoose.createConnection(cfg.usersDb);
var dbDevices = mongoose.createConnection(cfg.devicesDb);

dbUsers.on('error', (err) => {
	console.log('dbUsers error ', err);
})

dbUsers.on('open', () => {
	User.count({}, (err, cnt) => {
		if(err) {
			console.log(err);
		}
		if(cnt == 0){
			let admin = new User({
				username: 'admin',
				password: 'admin12345',
				admin: true
			});
			admin.save((err) => {
				if(!err) {
					admin.save();
					console.log('Admin saved');
				} else {
					console.log(err);
				}
			});
		}
	})
	console.log('Connected to usersDB');
})

dbUsers.on('close', () => {
	console.log('usersDB closed')
})

dbDevices.on('error', (err) => {
	console.log('devicesDB ', err);
});

dbDevices.on('open', () => {
	console.log('Connected to devicesDB');
})

var deviceSchema = new mongoose.Schema({
	deviceId: {
		type: String, 
		index: {
			unique: true
		}
	},
	status: String
});

var userSchema = new mongoose.Schema({
	username: String,
	password: String,
	admin: Boolean
});

var Device = dbDevices.model('Device', deviceSchema);
var User = dbUsers.model('userSchema', userSchema);

app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname + '/dist/index.html'));
});


apiRoutes.post('/auth', (req, res) => {
	console.log('body ', req.body);
	console.log('username ', req.body.username.toString());

	let atob = (str) => {
		return new Buffer(str, 'base64').toString();
	}

	let username = atob(req.body.username);
	let password = atob(req.body.password);

	console.log('username: ' username, ' password: ', password);

	User.findOne({username: username}, (err, user) => {
		if(err){
			console.log(err);
		}
		if(!user){
			console.log('user not found')
			res.writeHead('404',{
				'content-type': 'text/plain'
			});
			res.end('Not found');
		} else {
			console.log('user found');
			if(user.password != password) {
			res.writeHead('404',{
				'content-type': 'text/plain'
			});
			res.end('Not found');
			} else {
				let token = jwt.sign(user, app.get('superSecret'),
					{expiresIn: 60*60});
				res.json({
					username: user.username,
					token: token
				});
			}
		}
	})
});

apiRoutes.use((req, res, next) => {
	console.log('auth middleware token: ', req.headers['x-access-token']);
	let token = req.headers['x-access-token'];
	if (token) {
		jwt.verify(token, app.get('superSecret'), 
			(err, decoded) => {
				if(err){
					return res.json({
						success: false,
						message: 'Auth failed'
					});
				} else {
					req.decoded = decoded;
					next();
				}
			})
	} else {
		return res.status(403).send({
			success: false,
			message: 'Auth failed'
		})
	}
})

apiRoutes.get('/devices', (req, res) => {
	var getParams = url.parse(req.url, true).query;
	if(Object.keys(getParams).length == 0){
		dataservice.list(Device, res);
	} else {
		dataservice.findById(Device, getParams.id, res);
	}
});

apiRoutes.post('/devices', (req, res) => {
	dataservice.update(Device, req.body, res);
	var devInfo = req.body.deviceId + ':' + req.body.status;
	mqttPublish('xxx/zzz', devInfo,{
		retain: true,
		'qos': 2
	})
});

apiRoutes.get('/users', (req, res) => {
	userService.list(User, res);
});

apiRoutes.post('/users', (req, res) => {
	userService.update(User, req.body, res);
});

apiRoutes.delete('/users', (req, res) => {
	userService.remove(User, req.body, res);
})

var mqttPublish = (topic, msg) => {
	client.publish(topic, msg, () => {
		console.log('Message to MQTT server sent: ', msg);
	});
}

console.log('Server is up on localhost: ', app.get('port'));
http.createServer(app).listen(app.get('port'));
