var User = require('../models/user');
var Log = require('../models/log');

var usersController = function (server) {

	server.post('/api/signin', function(req, res) {
		var email = '';
		if (typeof req.body.user !== 'undefined')
			email = req.body.user;
		var pass = '';
		if (typeof req.body.pass !== 'undefined')
			pass = req.body.pass;

		if (email.trim() && pass.trim()) {
			User
				.find({email: email, password: pass, active: true}, function(error, users){
			  if (error) return res.status(400).send({code: 400, message: error.message});
			  if (users.length === 0) return res.status(400).send({code: 400, message: 'Usuario no encontrado'});

			  var token = utils.guid();

			  User.findOneAndUpdate({_id: users[0]._id}, {$set: {token: token}}, function(error, numReplaced) {
				if (error) return res.status(400).send({code: 400, message: error.message});

				// return res.json({signedIn: true, owner: users[0].owner, name: users[0].name, email: users[0].email, token: token, rol: users[0].rol});
				return res.json({signedIn: true, name: users[0].name, email: users[0].email, token: token, rol: users[0].rol});
			  });
			});
		} else {
			return res.status(400).send({code: 400, message: 'Datos incorrectos'});
		}
	});

	server.post('/api/signout/:token', function(req, res) {
		var token = '';
		if (typeof req.params.token !== 'undefined')
			token = req.params.token;
		if (token.trim()) {
			User.findOneAndUpdate({ token: token }, {$set: {token: ''}}, function(error, numReplaced){
			  if (error) return res.status(400).send({code: 400, message: error.message});

			  return res.json({ status: 'ok' });
			});
		} else {
			return res.status(400).send({code: 400, message: 'Token incorrecta'});
		}
	});

	server.get('/api/getMyUsers', function(req, res) {
		var token = '';
		if (typeof req.query.token !== 'undefined')
			token = req.query.token;
		var limit = 0;
		if (typeof req.query.limit !== 'undefined')
			limit = parseInt(req.query.limit, 10);
		var skip = 0;
		if (typeof req.query.skip !== 'undefined')
			skip = parseInt(req.query.skip, 10);
		var active = true;
		if (typeof req.query.active !== 'undefined')
			active = req.query.active;

		if (token !== '') {
			User
				.find({token: token}, function(error, users){
					if (error) return res.status(400).send({code: 400, message: error.message});
					if (users.length === 0) return res.status(400).send({code: 400, message: 'Usuario no encontrado'});

					var owner = users[0]._id;

					User.countDocuments({owner: owner, active: active}, function(err, count){
						if (err) return res.status(400).send({code: 400, message: err.message});

						if (limit === 0) limit = count;

						User.find({owner: owner, active: active})
							.populate({
								path: 'rol',
								select: 'owner name desc active',
								populate: {
									path: 'module',
									select: 'owner name desc active'
								}
							})
							.select('rol active owner name email date')
							.sort({name: 1})
							.skip(skip)
							.limit(limit)
							.exec(function(err, usrs) {
								if (err) return res.status(400).send({code: 400, message: err.message});

								//var uu = usrs.map(function(u) {return ({id: u._id, value: u.name});});
								return res.json({count: count, users: usrs});
						});
					});
				});
		} else {
			return res.status(400).send({code: 400, message: 'Token incorrecta'});
		}
	});

	server.post('/api/addUser/', function(req, res) {
		var token = '';
		if (typeof req.body.token !== 'undefined')
			token = req.body.token;

		if (token.trim()) {

			User
				.find({token: token}, function(error, users){
					if (error) return res.status(400).send({code: 400, message: error.message});
					if (users.length === 0) return res.status(400).send({code: 400, message: 'Usuario no encontrado'});

					var owner = users[0]._id;
					var name = '';
					if (typeof req.body.name !== 'undefined')
						name = req.body.name;
					var email = '';
					if (typeof req.body.email !== 'undefined')
						email = req.body.email;
					var password = '';
					if (typeof req.body.password !== 'undefined')
						password = req.body.password;
					var rol = [];
					if (typeof req.body.rol !== 'undefined')
						rol = req.body.rol;
					var active = true;
					if (typeof req.body.active !== 'undefined')
						active = req.body.active;

					if ((name.trim()) &&
						(email.trim()) &&
						(password.trim())
						){
							// verifico que el usuario no exista
							User.find({email: email}, function(errr, usrs){
								if (errr) return res.status(400).send({code: 400, message: errr.message});
								if (usrs.length !== 0) return res.status(400).send({code: 400, message: 'Usuario ya existe'});

								var usr = new User({owner: owner, name: name, email: email, password: password, rol: rol, active: active});
								usr.save(function(err, user){
									if (err) return res.status(400).send({code: 400, message: err.message});

									var detail = 'user:' + name + ',' + email + ',' + active + ',' + JSON.stringify(rol);
									var log = new Log({user: owner, operation: 1, detail: detail});
									log.save(function(er, lg){
										if (er) return res.status(400).send({code: 400, message: er.message});

										return res.json({ user: user });
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

	server.post('/api/updUserPass/', function(req, res) {
		var token = '';
		if (typeof req.body.token !== 'undefined')
			token = req.body.token;

		if (token.trim()) {

			User
				.find({token: token}, function(error, users){
					if (error) return res.status(400).send({code: 400, message: error.message});
					if (users.length === 0) return res.status(400).send({code: 400, message: 'Usuario no encontrado'});

					var owner = users[0]._id;

					var id = '';
					if (typeof req.body.id !== 'undefined')
						id = req.body.id;
					var name = '';
					if (typeof req.body.name !== 'undefined')
						name = req.body.name;
					var email = '';
					if (typeof req.body.email !== 'undefined')
						email = req.body.email;
					var password = '';
					if (typeof req.body.password !== 'undefined')
						password = req.body.password;
					var rol = [];
					if (typeof req.body.rol !== 'undefined')
						rol = req.body.rol;
					var active = false;
					if (typeof req.body.active !== 'undefined')
						active = req.body.active;

					if (id.trim() &&
						name.trim() &&
						email.trim() &&
						password.trim()
						){
							User.find({email: email}, function(errr, usrs){
								if (errr) return res.status(400).send({code: 400, message: errr.message});
								if ((usrs.length > 1) || ((usrs.length === 1) && (usrs[0]._id.toString() !== id))) return res.status(400).send({code: 400, message: 'Usuario ya existe'});

								User.findById(id, function(errrr, usr2upd){
									if (errrr) return res.status(400).send({code: 400, message: errrr.message});
									if (usr2upd === null) return res.status(400).send({code: 400, message: 'Usuario no existe'});

									if (usr2upd.owner.toString() === owner.toString()) {

										User.findOneAndUpdate({_id: id}, {name: name, email: email, password: password, rol: rol, active: active}, function(err, numReplaced){
											if (err) return res.status(400).send({code: 400, message: err.message});

											var detail = 'user:' + id + ',' + name + ',' + email + ',' + active + ',' + JSON.stringify(rol);
											var log = new Log({user: owner, operation: 2, detail: detail});
											log.save(function(er, lg){
												if (er) return res.status(400).send({code: 400, message: er.message});

												return res.json({ user: {_id: id, name: name, email: email, rol: rol, active: active} });
											});
										});
									}
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

	server.post('/api/updUser/', function(req, res) {
		var token = '';
		if (typeof req.body.token !== 'undefined')
			token = req.body.token;

		if (token.trim()) {

			User
				.find({token: token}, function(error, users){
					if (error) return res.status(400).send({code: 400, message: error.message});
					if (users.length === 0) return res.status(400).send({code: 400, message: 'Usuario no encontrado'});

					var owner = users[0]._id;

					var id = '';
					if (typeof req.body.id !== 'undefined')
						id = req.body.id;
					var name = '';
					if (typeof req.body.name !== 'undefined')
						name = req.body.name;
					var email = '';
					if (typeof req.body.email !== 'undefined')
						email = req.body.email;
					var rol = [];
					if (typeof req.body.rol !== 'undefined')
						rol = req.body.rol;
					var active = false;
					if (typeof req.body.active !== 'undefined')
						active = req.body.active;

					if (id.trim() &&
						name.trim() &&
						email.trim()
						){
							User.find({email: email}, function(errr, usrs){
								if (errr) return res.status(400).send({code: 400, message: errr.message});
								if ((usrs.length > 1) || ((usrs.length === 1) && (usrs[0]._id.toString() !== id))) return res.status(400).send({code: 400, message: 'Usuario ya existe'});

								User.findById(id, function(errrr, usr2upd){
									if (errrr) return res.status(400).send({code: 400, message: errrr.message});
									if (usr2upd === null) return res.status(400).send({code: 400, message: 'Usuario no existe'});

									if (usr2upd.owner.toString() === owner.toString()) {

										User.findOneAndUpdate({_id: id}, {name: name, email: email, rol: rol, active: active}, function(err, numReplaced){
											if (err) return res.status(400).send({code: 400, message: err.message});

											var detail = 'user:' + id + ',' + name + ',' + email + ',' + active + ',' + JSON.stringify(rol);
											var log = new Log({user: owner, operation: 2, detail: detail});
											log.save(function(er, lg){
												if (er) return res.status(400).send({code: 400, message: er.message});

												return res.json({ user: {_id: id, name: name, email: email, rol: rol, active: active} });
											});
										});
									} else {
										return res.status(400).send({code: 400, message: 'No tiene permisos para modificar'});
									}
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

	server.delete('/api/delUser/:token/:id', function(req, res) {
		var token = '';
		if (typeof req.params.token !== 'undefined')
			token = req.params.token;

		if (token.trim()) {

			User
				.find({token: token}, function(error, users){
					if (error) return res.status(400).send({code: 400, message: error.message});
					if (users.length === 0) return res.status(400).send({code: 400, message: 'Usuario no encontrado'});

					var owner = users[0]._id;

					var id = '';
					if (typeof req.params.id !== 'undefined')
						id = req.params.id;

					if (id.trim()){
						// verifico que el usuario no se elimine a si mismo
						if (users[0]._id.toString() === id.toString()) {
							return res.status(400).send({code: 400, message: 'Imposible eliminar su propio usuario'});
						}

						// verifico que el usuario no tenga registros en el log
						Log.find({user: id}, function(errr, logs){
							if (errr) return res.status(400).send({code: 400, message: errr.message});
							if (logs.length > 0) return res.status(400).send({code: 400, message: 'No es posible eliminar Usuario con registros en el sistema. Desactívelo.'});

							User.findOneAndDelete({_id: id}, function(errrr, usrs){
								if (errrr) return res.status(400).send({code: 400, message: errrr.message});

								var detail = 'user:' + id.toString();
								var log = new Log({user: owner, operation: 3, detail: detail});
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

	server.post('/api/changePass/', function(req, res) {
		var token = '';
		if (typeof req.body.token !== 'undefined')
			token = req.body.token.trim();
		var password = '';
		if (typeof req.body.pass !== 'undefined')
			password = req.body.pass.trim();
		var newpassword = '';
		if (typeof req.body.newpass !== 'undefined')
			newpassword = req.body.newpass.trim();

		if ((token !== '') &&
				(password !== '') &&
				(newpassword !== '')) {

			User
				.find({token: token, password: password}, function(error, users){
					if (error) return res.status(400).send({code: 400, message: error.message});
					if (users.length === 0) return res.status(400).send({code: 400, message: 'Usuario no encontrado'});

					var id = users[0]._id;

					User.findOneAndUpdate({_id: id}, {password: newpassword}, function(err, numReplaced){
						if (err) return res.status(400).send({code: 400, message: err.message});

						var detail = 'usernpass:' + id;
						var log = new Log({user: id, operation: 2, detail: detail});
						log.save(function(er, lg){
							if (er) return res.status(400).send({code: 400, message: er.message});

							return res.json({ ok: true });
						});
					});
				});
		} else {
			return res.status(400).send({code: 400, message: 'Datos incorrectos'});
		}
	});


	server.get('/api/getUserData', function(req, res) {
		var token = '';
		if (typeof req.query.token !== 'undefined')
			token = req.query.token;
		var email = '';
		if (typeof req.query.email !== 'undefined')
			email = req.query.email;

		if (token !== '') {
			User
				.find({token: token}, function(error, users) {
					if (error) return res.status(400).send({code: 400, message: error.message});
					if (users.length === 0) return res.status(400).send({code: 400, message: 'Usuario no encontrado'});

					User.find({email: email})
						.populate({
							path: 'rol',
							select: 'owner name desc active',
							populate: {
								path: 'module',
								select: 'owner name desc active'
							}
						})
						.select('rol active owner name date')
						.exec(function(err, usrs) {
							if (err) return res.status(400).send({code: 400, message: err.message});

							return res.json({user: usrs});
					});
				});
		} else {
			return res.status(400).send({code: 400, message: 'Token incorrecta'});
		}
	});

	server.post('/api/updOtherUser/', function(req, res) {
		var token = '';
		if (typeof req.body.token !== 'undefined')
			token = req.body.token;

		if (token.trim()) {

			User
				.find({token: token}, function(error, users){
					if (error) return res.status(400).send({code: 400, message: error.message});
					if (users.length === 0) return res.status(400).send({code: 400, message: 'Usuario no encontrado'});

					var owner = users[0]._id;

					var email = '';
					if (typeof req.body.email !== 'undefined')
						email = req.body.email.trim();
					var rol = [];
					if (typeof req.body.rol !== 'undefined')
						rol = req.body.rol;

					if (email) {
							User.findOne({email: email}, function(errr, usr) {
								if (errr) return res.status(400).send({code: 400, message: errr.message});
								if (usr === null) return res.status(400).send({code: 400, message: 'Usuario no existe'});

								User.findOneAndUpdate({email: email}, {rol: rol}, function(err, numReplaced) {
									if (err) return res.status(400).send({code: 400, message: err.message});

									var detail = 'updother:' + email + ',' + JSON.stringify(rol);
									var log = new Log({user: owner, operation: 2, detail: detail});
									log.save(function(er, lg) {
										if (er) return res.status(400).send({code: 400, message: er.message});

										return res.json({ ok: true });
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


};

module.exports = usersController;
