var User = require('../models/user');
var Module = require('../models/module');
var Rol = require('../models/rol');
var Table = require('../models/table');
var Log = require('../models/log');

var modulesController = function (server) {

	server.get('/api/getModules', function(req, res) {
		var token = '';
		if (typeof req.query.token !== 'undefined') {
			token = req.query.token.trim();
		}

		if (token !== '') {

			User
				.find({token: token}, function(error, users) {
					if (error) return res.status(400).send({code: 400, message: error.message});
					if (users.length === 0) return res.status(400).send({code: 400, message: 'Usuario no encontrado'});

					var owner = users[0]._id;
					var rol = users[0].rol;

					var sel = {};
					if (typeof req.query.active !== 'undefined') {
						sel = {active: req.query.active === 'true'};
					}

					Module.find(sel)
						.populate({
							path: 'friend',
							select: 'owner name desc active',
							populate: {
								path: 'module',
								select: 'owner name desc active'
							}
						})
						.exec(function(err, modules){
						if (err) return res.status(400).send({code: 400, message: err.message});

						var mdls = modules.filter(m => ((m.owner.toString() === owner.toString()) || (m.friend.some(f => (rol.indexOf(f) > -1)))));
						var count = mdls.length;

						var limit = 0;
						if (typeof req.query.limit !== 'undefined') {
							limit = parseInt(req.query.limit, 10);
						}
						if (limit === 0) limit = count;
						var skip = 0;
						if (typeof req.query.skip !== 'undefined') {
							skip = parseInt(req.query.skip, 10);
						}

						if (skip > 0) mdls.splice(0, skip);
						if (limit < mdls.length) mdls.splice(limit, mdls.length);

						return res.json({count: count, modules: mdls});
					});

				});
		} else {
			return res.json({modules: []});
		}
	});

	server.post('/api/addModule/', function(req, res) {
		var token = '';
		if (typeof req.body.token !== 'undefined') {
			token = req.body.token.trim();
		}

		if (token !== '') {

			User
				.find({token: token}, function(error, users){
					if (error) return res.status(400).send({code: 400, message: error.message});
					if (users.length === 0) return res.status(400).send({code: 400, message: 'Usuario no encontrado'});

					var owner = users[0]._id;

					var name = '';
					if (typeof req.body.name !== 'undefined') {
						name = req.body.name.trim();
					}
					var desc = '';
					if (typeof req.body.desc !== 'undefined') {
						desc = req.body.desc.trim();
					}
					var active = false;
					if (typeof req.body.active !== 'undefined') {
						active = req.body.active;
					}
					var friend = [];
					tp = typeof req.body.friend;
					if (req.body.friend !== 'undefined') {
						friend = req.body.friend;
					}

					if ((name !== '') &&
						(desc !== '')
						){
							// verifico que el module no exista
							Module.find({owner: owner, name: name}, function(errr, mdls){
								if (errr) return res.status(400).send({code: 400, message: errr.message});
								if (mdls.length !== 0) return res.status(400).send({code: 400, message: 'Modulo ya existe'});

								var mdl = new Module({owner, name, desc, active, friend});
								mdl.save(function(err, modules){
									if (err) return res.status(400).send({code: 400, message: err.message});

									var detail = 'module:' + name + ',' + desc + ',' + active + ',' + JSON.stringify(friend);
									var log = new Log({user: owner, operation: 1, detail: detail});
									log.save(function(er, lg){
										if (er) return res.status(400).send({code: 400, message: er.message});

										return res.json({ module: modules });
									});
								});
							});
					} else {
						return res.status(400).send({code: 400, message: 'Datos incorrectos'});
					}
				});
		} else {
			return res.status(400).send({code: 400, message: 'Token incorrecta'});
		}
	});

	server.post('/api/updModule/', function(req, res) {
		var token = '';
		if (typeof req.body.token !== 'undefined') {
			token = req.body.token.trim();
		}

		if (token !== '') {

			User
				.find({token}, function(error, users){
					if (error) return res.status(400).send({code: 400, message: error.message});
					if (users.length === 0) return res.status(400).send({code: 400, message: 'Usuario no encontrado'});

					var owner = users[0]._id;

					var id = '';
					if (typeof req.body.id !== 'undefined') {
						id = req.body.id.trim();
					}

					var name = '';
					if (typeof req.body.name !== 'undefined') {
						name = req.body.name.trim();
					}
					var desc = '';
					if (typeof req.body.desc !== 'undefined') {
						desc = req.body.desc.trim();
					}
					var active = false;
					if (typeof req.body.active !== 'undefined') {
						active = req.body.active;
					}
					var friend = [];
					if (typeof req.body.friend !== 'undefined') {
						friend = req.body.friend;
					}

					if ((id !== '') &&
						(name !== '') &&
						(desc !== '')
						){
							Module.find({owner, name}, function(errr, mdls){
								if (errr) return res.status(400).send({code: 400, message: errr.message});
								if ((mdls.length > 1) || ((mdls.length === 1) && (mdls[0]._id.toString() !== id))) return res.status(400).send({code: 400, message: 'Modulo ya existe'});

								Module.findOneAndUpdate({_id: id}, {$set: {owner, name, desc, active, friend}}, function(err, numReplaced){
									if (err) return res.status(400).send({code: 400, message: err.message});

									var detail = 'module:' + id + ',' + name + ',' + desc + ',' + active + ',' + JSON.stringify(friend);
									var log = new Log({user: owner, operation: 2, detail: detail});
									log.save(function(er, lg){
										if (er) return res.status(400).send({code: 400, message: er.message});

										return res.json({ module: {_id: id, owner, name, desc, active, friend} });
									});
								});
							});
					} else {
						return res.status(400).send({code: 400, message: 'Datos incorrectos'});
					}
				});
		} else {
			return res.status(400).send({code: 400, message: 'Token incorrecta'});
		}
	});


	server.delete('/api/delModule/:token/:id', function(req, res) {
		var token = '';
		if (typeof req.params.token !== 'undefined') {
			token = req.params.token.trim();
		}

		if (token !== '') {

			User
				.find({token}, function(error, users){
					if (error) return res.status(400).send({code: 400, message: error.message});
					if (users.length === 0) return res.status(400).send({code: 400, message: 'Usuario no encontrado'});

					var owner = users[0]._id;

					var id = '';
					if (typeof req.params.id !== 'undefined') {
						id = req.params.id.trim();
					}

					if (id !== ''){
						// verifico que el modulo no se este usando en algun rol
						Rol.find({module: id}, function(errrr, roles) {
							if (errrr) return res.status(400).send({code: 400, message: errrr.message});
							if (roles.length > 0) return res.status(400).send({code: 400, message: 'Hay roles del modulo'});

							// verifico que el modulo no se este usando en alguna table
							Table.find({module: id}, function(errr, tables) {
								if (errr) return res.status(400).send({code: 400, message: errr.message});
								if (tables.length > 0) return res.status(400).send({code: 400, message: 'Hay tablas del modulo'});

								Module.findByIdAndRemove(id, function(err){
									if (err) return res.status(400).send({code: 400, message: err.message});

									var detail = 'module:' + id.toString();
									var log = new Log({user: owner, operation: 3, detail: detail});
									log.save(function(er, lg){
										if (er) return res.status(400).send({code: 400, message: er.message});

										return res.json({ 'ok': true });
									});
								});
							});

						});
					} else {
						return res.status(400).send({code: 400, message: 'Datos incorrectos'});
					}
				});
		} else {
			return res.status(400).send({code: 400, message: 'Token incorrecta'});
		}
	});
}

module.exports = modulesController;
