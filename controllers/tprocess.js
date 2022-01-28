var User = require('../models/user');
var TProcess = require('../models/tprocess');

var tprocessController = function (server) {

	server.get('/api/getTProcess', function(req, res) {
		var token = '';
		if (typeof req.query.token !== 'undefined')
			token = req.query.token;

		if (token !== '') {
			User
				.find({token: token}, function(error, users) {
					if (error) return res.status(400).send({code: 400, message: error.message});
					if (users.length === 0) return res.status(400).send({code: 400, message: 'Usuario no encontrado'});

					TProcess.find({}, function(err, tprocess){
						if (err) return res.status(400).send({code: 400, message: err.message});

						return res.json({tprocess});
					});

				});
		} else {
			return res.json({tprocess: []});
		}
	});

}

module.exports = tprocessController;
