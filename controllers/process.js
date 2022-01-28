var User = require('../models/user');
var Module = require('../models/module');
var Rol = require('../models/rol');
var Field = require('../models/field');
var FieldStage = require('../models/fieldstage');
var Table = require('../models/table');
var Log = require('../models/log');
var Process = require('../models/process');
var Stage = require('../models/stage');

var processController = function (server) {

	server.get('/api/getProcess', function(req, res) {
		var token = '';
		if (typeof req.query.token !== 'undefined')
			token = req.query.token;

		if (token !== '') {

			User
				.find({token: token}, function(error, users) {
					if (error) return res.status(400).send({code: 400, message: error.message});
					if (users.length === 0) return res.status(400).send({code: 400, message: 'Usuario no encontrado'});

					var owner = users[0]._id.toString();
					var rol = users[0].rol;

					Process.find({})
						.populate({path: 'tprocess', select: 'name'})
						.populate({
							path: 'friend',
							select: 'owner name desc active',
							populate: {
								path: 'module',
								select: 'owner name desc active'
							}
						})
						.populate({
							path: 'data',
							select: 'owner name desc active',
							populate: {
								path: 'module',
								select: 'owner name desc active'
							}
						})
						.populate({path: 'firststage', select: 'name desc'})
						.populate({path: 'stage', select: 'name desc active'})
						.exec(function(err, process){
						if (err) return res.status(400).send({code: 400, message: err.message});

						var prcs = process.filter(p => ((p.owner.toString() === owner) || (p.friend.some(f => (rol.indexOf(f._id) > -1)))));
						var count = prcs.length;

						var limit = 0;
						if (typeof req.query.limit !== 'undefined') limit = parseInt(req.query.limit, 10);
						if (limit === 0) limit = count;
						var skip = 0;
						if (typeof req.query.skip !== 'undefined') skip = parseInt(req.query.skip, 10);

						if (skip > 0) prcs.splice(0, skip);
						if (limit < prcs.length) prcs.splice(limit, prcs.length);

						return res.json({count, process: prcs});
					});

				});
		} else {
			return res.json({count: 0, process: []});
		}
	});

	server.post('/api/addProcess/', function(req, res) {
		var token = '';
		if (typeof req.body.token !== 'undefined')
			token = req.body.token;

		if (token !== '') {

			User
				.find({token: token}, function(error, users){
					if (error) return res.status(400).send({code: 400, message: error.message});
					if (users.length === 0) return res.status(400).send({code: 400, message: 'Usuario no encontrado'});

					var owner = users[0]._id;

					var name = '';
					if (typeof req.body.name !== 'undefined')
						name = req.body.name;
					var desc = '';
					if (typeof req.body.desc !== 'undefined')
						desc = req.body.desc;
					var tprocess = '';
					if (typeof req.body.tprocess !== 'undefined')
						tprocess = req.body.tprocess;
					var active = false;
					if (typeof req.body.active !== 'undefined')
						active = req.body.active;
					var friend = [];
					if (typeof req.body.friend !== 'undefined')
						friend = req.body.friend;
					var data = [];
					if (typeof req.body.data !== 'undefined')
						data = req.body.data;

					if ((name !== '') &&
						(desc !== '') &&
						(tprocess !== '')
						){
							// verifico que el proceso no exista
							Process.find({name: name, owner: owner}, function(errr, prcs) {
								if (errr) return res.status(400).send({code: 400, message: errr.message});
								if (prcs.length !== 0) return res.status(400).send({code: 400, message: 'Proceso ya existe'});

								var prc = new Process({owner, name, desc, tprocess, active, friend, data});
								prc.save(function(err, process){
									if (err) return res.status(400).send({code: 400, message: err.message});

									var detail = 'process:' + name + ',' + desc + ',' + tprocess + ',' + active + ',' + JSON.stringify(data);
									var log = new Log({user: owner, operation: 1, detail: detail});
									log.save(function(er, lg){
										if (er) return res.status(400).send({code: 400, message: er.message});

										return res.json({ process });
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

	server.post('/api/updProcess/', function(req, res) {
		var token = '';
		if (typeof req.body.token !== 'undefined')
			token = req.body.token;

		if (token !== '') {

			User
				.find({token}, function(error, users){
					if (error) return res.status(400).send({code: 400, message: error.message});
					if (users.length === 0) return res.status(400).send({code: 400, message: 'Usuario no encontrado'});

					var owner = users[0]._id;

					var id = '';
					if (typeof req.body.id !== 'undefined')
						id = req.body.id;
					var name = '';
					if (typeof req.body.name !== 'undefined')
						name = req.body.name;
					var desc = '';
					if (typeof req.body.desc !== 'undefined')
						desc = req.body.desc;
					var tprocess = '';
					if (typeof req.body.tprocess !== 'undefined')
						tprocess = req.body.tprocess;
					var active = false;
					if (typeof req.body.active !== 'undefined')
						active = req.body.active;
					var friend = [];
					if (typeof req.body.friend !== 'undefined')
						friend = req.body.friend;
					var data = [];
					if (typeof req.body.data !== 'undefined')
						data = req.body.data;

					if ((id !== '') &&
						(name !== '') &&
						(desc !== '') &&
						(tprocess !== '')
						){
							Process.find({name}, function(errr, prcs){
								if (errr) return res.status(400).send({code: 400, message: errr.message});
								if ((prcs.length > 1) || ((prcs.length === 1) && (prcs[0]._id.toString() !== id))) return res.status(400).send({code: 400, message: 'Proceso ya existe'});

								Process.findOneAndUpdate({_id: id}, {$set: {name, desc, tprocess, active, friend, data}}, function(err, numReplaced){
									if (err) return res.status(400).send({code: 400, message: err.message});

									var detail = 'process:' + id + ',' + name + ',' + desc + ',' + tprocess + ',' + active + ',' + JSON.stringify(friend) + ',' + JSON.stringify(data);
									var log = new Log({user: owner, operation: 2, detail: detail});
									log.save(function(er, lg){
										if (er) return res.status(400).send({code: 400, message: er.message});

										return res.json({ 'ok': true });
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

	server.post('/api/setFirstStage/', function(req, res) {
		var token = '';
		if (typeof req.body.token !== 'undefined')
			token = req.body.token;

		if (token !== '') {

			User
				.find({token}, function(error, users){
					if (error) return res.status(400).send({code: 400, message: error.message});
					if (users.length === 0) return res.status(400).send({code: 400, message: 'Usuario no encontrado'});

					var owner = users[0]._id;

					var process = '';
					if (typeof req.body.process !== 'undefined')
						process = req.body.process;
					var firststage = '';
					if (typeof req.body.firststage !== 'undefined')
						firststage = req.body.firststage;

					if ((process !== '') &&
						(firststage !== '')
						){
								Process.findOneAndUpdate({_id: process}, {$set: {firststage: firststage}}, function(err, numReplaced){
									if (err) return res.status(400).send({code: 400, message: err.message});

									var detail = 'firstStage:' + process + ',' + firststage;
									var log = new Log({user: owner, operation: 2, detail: detail});
									log.save(function(er, lg){
										if (er) return res.status(400).send({code: 400, message: er.message});

										return res.json({ 'ok': true });
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

 	server.delete('/api/delProcess/:token/:id', function(req, res) {
		var token = '';
		if (typeof req.params.token !== 'undefined')
			token = req.params.token;

		if (token !== '') {

			User
				.find({token}, function(error, users){
					if (error) return res.status(400).send({code: 400, message: error.message});
					if (users.length === 0) return res.status(400).send({code: 400, message: 'Usuario no encontrado'});

					var owner = users[0]._id;

					var id = '';
					if (typeof req.params.id !== 'undefined')
						id = req.params.id;

					if (id !== '') {
            // verifico que no existan datos del Proceso

            // verifico que no se haga referencia a alguna etapa de este proceso
            // desde otra etapa de otro proceso

						// verifico que el modulo no se este usando en algun rol
						//Rol.find({module: id}, function(errrr, roles) {
							//if (errrr) return res.status(400).send({code: 400, message: errrr});
							//if (roles.length > 0) return res.status(400).send({code: 400, message: 'El modulo esta en uso por roles'});

							// busco el proceso que voy a eliminar para eliminar los campos de las Etapas
							Process.findById(id, function(error, theprocess) {
								if (error) return res.status(400).send({code: 400, message: error.message});

								if (theprocess) {

									// Elimino los campos de las Etapas
									FieldStage.deleteMany({stage: theprocess.stage}, function(errorr) {
										if (errorr) return res.status(400).send({code: 400, message: errorr.message});

										// elimino todas las etapas del proceso
										Stage.deleteMany({process: id}, function(errr){
											if (errr) return res.status(400).send({code: 400, message: errr.message});

											// elimino el proceso
											Process.findByIdAndRemove(id, function(err){
												if (err) return res.status(400).send({code: 400, message: err.message});

												var detail = 'process:' + id.toString();
												var log = new Log({user: owner, operation: 3, detail: detail});
												log.save(function(er, lg){
													if (er) return res.status(400).send({code: 400, message: er.message});

													return res.json({ 'ok': true });
												});
											});

										});

									});

								}

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

module.exports = processController;
