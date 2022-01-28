var User = require('../models/user');
var Module = require('../models/module');
var Rol = require('../models/rol');
var Table = require('../models/table');
var Process = require('../models/process');
var Log = require('../models/log');

var rolesController = function (server) {

	server.get('/api/getRoles', function(req, res) {
		var token = '';
		if (typeof req.query.token !== 'undefined')
			token = req.query.token;

		if (token !== '') {

			User
				.find({token: token}, function(error, users) {
					if (error) return res.status(400).send({code: 400, message: error.message});
					if (users.length === 0) return res.status(400).send({code: 400, message: 'Usuario no encontrado'});

					var mdl = 0;
					if (typeof req.query.module !== 'undefined')
						mdl = req.query.module;

					if (mdl) {

						var sel = {module: mdl};
						if (typeof req.query.active !== 'undefined') {
							sel.active = req.query.active === 'true';
						}

						Rol.countDocuments(sel, function(err, count){
							if (err) return res.status(400).send({code: 400, message: err.message});

							var limit = 0;
							if (typeof req.query.limit !== 'undefined') limit = parseInt(req.query.limit, 10);
							if (limit === 0) limit = count;
							var skip = 0;
							if (typeof req.query.skip !== 'undefined') skip = parseInt(req.query.skip, 10);

							Rol.find(sel).sort({name: 1}).skip(skip).limit(limit).exec(function(errr, roles) {
								if (errr) return res.status(400).send({code: 400, message: errr.message});

								return res.json({count: count, roles: roles});
							});
						})

					} else {
						return res.json({count: 0, roles: []});
					}

				});
		} else {
			return res.json({roles: []});
		}
	});

	server.post('/api/addRol/', function(req, res) {
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
					var active = false;
					if (typeof req.body.active !== 'undefined')
						active = req.body.active;
					var module = '';
					if (typeof req.body.module !== 'undefined')
						module = req.body.module;

					if ((name !== '') &&
						(desc !== '') &&
						(module !== '')
						){

							// verifico que el rol no exista en el modulo
							Rol.find({module: module, name: name}, function(errr, roles){
								if (errr) return res.status(400).send({code: 400, message: errr.message});
								if (roles.length !== 0) return res.status(400).send({code: 400, message: 'Rol ya existe'});

								var rol = new Rol({owner, name, desc, active, module});
								rol.save(function(err, role){
									if (err) return res.status(400).send({code: 400, message: err.message});

									var detail = 'rol:' + name + ',' + desc + ',' + active + ',' + module;
									var log = new Log({user: owner, operation: 1, detail: detail});
									log.save(function(er, lg){
										if (er) return res.status(400).send({code: 400, message: er.message});

										return res.json({ rol: role });
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

	server.post('/api/updRol/', function(req, res) {
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
					var active = false;
					if (typeof req.body.active !== 'undefined')
						active = req.body.active;
					var module = '';
					if (typeof req.body.module !== 'undefined')
						module = req.body.module;

					if ((id !== '') &&
						(name !== '') &&
						(desc !== '') &&
						(module !== '')
						){
							Rol.find({module, name}, function(errr, roles){
								if (errr) return res.status(400).send({code: 400, message: errr.message});
								if ((roles.length > 1) || ((roles.length === 1) && (roles[0]._id.toString() !== id))) return res.status(400).send({code: 400, message: 'Rol ya existe'});

								Rol.findOneAndUpdate({_id: id}, {$set: {owner, name, desc, active}}, function(err, numReplaced){
									if (err) return res.status(400).send({code: 400, message: err.message});

									var detail = 'rol:' + id + ',' + name + ',' + desc + ',' + active;
									var log = new Log({user: owner, operation: 2, detail: detail});
									log.save(function(er, lg){
										if (er) return res.status(400).send({code: 400, message: er.message});

										return res.json({ rol: {_id: id, owner, name, desc, active} });
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

	server.delete('/api/delRol/:token/:id', function(req, res) {
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

					if (id !== ''){
						// verifico que el rol no se este usando en algun usuario,
						// que algun modulo no lo tenga como friend,
						// que alguna tabla no lo tenga como friend,
						// que algun proceso no lo tenga como friend,
						User.find({rol: id}, function(err, usrs){
							if (err) return res.status(400).send({code: 400, message: err.message});
							if (usrs.length > 0) return res.status(400).send({code: 400, message: 'El rol se ha asignado a usuarios'});

							Module.find({friend: id}, function(errr, mdls){
								if (errr) return res.status(400).send({code: 400, message: errr.message});
								if (mdls.length > 0) return res.status(400).send({code: 400, message: 'El rol se ha asignado a permisos en modulos'});

								Table.find({friend: id}, function(erorr, tbls){
									if (erorr) return res.status(400).send({code: 400, message: erorr.message});
									if (tbls.length > 0) return res.status(400).send({code: 400, message: 'El rol se ha asignado a permisos en tablas'});

									Table.find({data: id}, function(erorrr, dtbls){
										if (erorrr) return res.status(400).send({code: 400, message: erorrr.message});
										if (dtbls.length > 0) return res.status(400).send({code: 400, message: 'El rol se ha asignado a datos en tablas'});

										Process.find({friend: id}, function(erororr, prs){
											if (erororr) return res.status(400).send({code: 400, message: erororr.message});
											if (prs.length > 0) return res.status(400).send({code: 400, message: 'El rol se ha asignado a procesos'});

											Rol.findOneAndDelete({ _id: id }, function(errrr, roles){
												if (errrr) return res.status(400).send({code: 400, message: errrr.message});

												var detail = 'rol:' + id;
												var log = new Log({user: owner, operation: 3, detail: detail});
												log.save(function(er, lg){
													if (er) return res.status(400).send({code: 400, message: er.message});

													return res.json({ 'ok': true });
												});

											});
										});
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

module.exports = rolesController;
