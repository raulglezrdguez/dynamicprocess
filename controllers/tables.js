var User = require('../models/user');
var Module = require('../models/module');
var Rol = require('../models/rol');
var Field = require('../models/field');
var Table = require('../models/table');
var DataTable = require('../models/datatable');
var Log = require('../models/log');

var tablesController = function (server) {

	// tablas que puede editar el usuario
	server.get('/api/getTables', function(req, res) {
		var token = '';
		if (typeof req.query.token !== 'undefined')
			token = req.query.token;
		var module = '';
		if (typeof req.query.module !== 'undefined')
			module = req.query.module;

		if ((token !== '') && (module !== '')){

			User
				.find({token: token}, function(error, users) {
					if (error) return res.status(400).send({code: 400, message: error.message});
					if (users.length === 0) return res.status(400).send({code: 400, message: 'Usuario no encontrado'});

					var owner = users[0]._id;
					var rol = users[0].rol;

					var sel = {module};
					if (typeof req.query.active !== 'undefined') {
						sel.active = req.query.active === 'true';
					}

					Table.find(sel)
						.populate({path: 'module', select: 'owner name desc active'})
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
						.populate({path: 'field', select: 'name kind value desc obligatory'})
						.exec(function(err, tables){
						if (err) return res.status(400).send({code: 400, message: err.message});

						var tbls = tables.filter(t => ((t.owner.toString() === owner.toString()) || (t.friend.some(f => (rol.indexOf(f._id) > -1)))));
						var count = tbls.length;

						var limit = 0;
						if (typeof req.query.limit !== 'undefined') limit = parseInt(req.query.limit, 10);
						if (limit === 0) limit = count;
						var skip = 0;
						if (typeof req.query.skip !== 'undefined') skip = parseInt(req.query.skip, 10);

						if (skip > 0) tbls.splice(0, skip);
						if (limit < tbls.length) tbls.splice(limit, tbls.length);

						return res.json({count: count, tables: tbls});
					});

				});
		} else {
			return res.json({tables: []});
		}
	});

	// tablas en que puede entrar datos el usuario
	server.get('/api/getTablesData', function(req, res) {
		var token = '';
		if (typeof req.query.token !== 'undefined')
			token = req.query.token;

		if (token !== '') {

			User
				.find({token: token}, function(error, users) {
					if (error) return res.status(400).send({code: 400, message: error.message});
					if (users.length === 0) return res.status(400).send({code: 400, message: 'Usuario no encontrado'});

					var owner = users[0]._id;
					var rol = users[0].rol;

					var sel = {};
					if (typeof req.query.active !== 'undefined') {
						sel.active = req.query.active === 'true';
					}

					Table.find(sel)
						.populate({path: 'module', select: 'owner name desc active'})
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
						.populate({path: 'field', select: 'name kind value desc obligatory'})
						.exec(function(err, tables){
						if (err) return res.status(400).send({code: 400, message: err.message});

						var tbls = tables.filter(t => ((t.owner.toString() === owner.toString()) || (t.friend.some(function(f) {return (rol.indexOf(f._id) > -1)})) || (t.data.some(function(d) {return (rol.indexOf(d._id) > -1)}))));
						var count = tbls.length;

						var limit = 0;
						if (typeof req.query.limit !== 'undefined') limit = parseInt(req.query.limit, 10);
						if (limit === 0) limit = count;
						var skip = 0;
						if (typeof req.query.skip !== 'undefined') skip = parseInt(req.query.skip, 10);

						if (skip > 0) tbls.splice(0, skip);
						if (limit < tbls.length) tbls.splice(limit, tbls.length);

						return res.json({count: count, tables: tbls});
					});

				});
		} else {
			return res.json({tables: []});
		}
	});

	// tablas activas de datos publicos, en las que todos sus datos son publicos
	server.get('/api/getPublicTables', function(req, res) {

			Table.find({active: true, free: true})
				.populate({path: 'module', select: 'owner name desc active'})
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
				.populate({path: 'field', select: 'name kind value desc obligatory'})
				.exec(function(err, tables){
				if (err) return res.status(400).send({code: 400, message: err.message});

				var count = tables.length;

				var limit = 0;
				if (typeof req.query.limit !== 'undefined') limit = parseInt(req.query.limit, 10);
				if (limit === 0) limit = count;
				var skip = 0;
				if (typeof req.query.skip !== 'undefined') skip = parseInt(req.query.skip, 10);

				if (skip > 0) tables.splice(0, skip);
				if (limit < tables.length) tables.splice(limit, tables.length);

				return res.json({count: count, tables: tables});
			});

	});

	server.post('/api/addTable/', function(req, res) {
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
					var module = '';
					if (typeof req.body.module !== 'undefined')
						module = req.body.module;
					var active = false;
					if (typeof req.body.active !== 'undefined')
						active = req.body.active;
					var friend = [];
					if (typeof req.body.friend !== 'undefined')
						friend = req.body.friend;
					var data = [];
					if (typeof req.body.data !== 'undefined')
						data = req.body.data;
					var free = false;
					if (typeof req.body.free !== 'undefined')
						free = req.body.free;

					if ((name !== '') &&
						(desc !== '') &&
						(module !== '')) {
							// verifico que la tabla no exista
							Table.find({owner: owner, name: name}, function(errr, tbls) {
								if (errr) return res.status(400).send({code: 400, message: errr.message});
								if (tbls.length !== 0) return res.status(400).send({code: 400, message: 'Tabla ya existe'});

								var tbl = new Table({owner, name, desc, module, active, friend, data, free});
								tbl.save(function(err, tables){
									if (err) return res.status(400).send({code: 400, message: err.message});

									var detail = 'table:' + name + ',' + desc + ',' + module + ',' + active + ',' + free + ',' + JSON.stringify(friend) + ',' + JSON.stringify(data);
									var log = new Log({user: owner, operation: 1, detail: detail});
									log.save(function(er, lg){
										if (er) return res.status(400).send({code: 400, message: er.message});

										return res.json({ table: tables });
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

	server.post('/api/updTable/', function(req, res) {
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
					var module = '';
					if (typeof req.body.module !== 'undefined')
						module = req.body.module;
					var active = false;
					if (typeof req.body.active !== 'undefined')
						active = req.body.active;
					var friend = [];
					if (typeof req.body.friend !== 'undefined')
						friend = req.body.friend;
					var data = [];
					if (typeof req.body.data !== 'undefined')
						data = req.body.data;
					var free = false;
					if (typeof req.body.free !== 'undefined')
						free = req.body.free;

					if ((id !== '') &&
						(name !== '') &&
						(desc !== '') &&
						(module !== '')) {
							Table.find({owner, name}, function(errr, tbls){
								if (errr) return res.status(400).send({code: 400, message: errr.message});
								if ((tbls.length > 1) || ((tbls.length === 1) && (tbls[0]._id.toString() !== id))) return res.status(400).send({code: 400, message: 'Tabla ya existe'});

								Table.findOneAndUpdate({_id: id}, {$set: {owner, name, desc, module, active, friend, data, free}}, function(err, numReplaced){
									if (err) return res.status(400).send({code: 400, message: err.message});

									var detail = 'table:' + id + ',' + name + ',' + desc + ',' + module + ',' + active + ',' + free + ',' + JSON.stringify(friend) + ',' + JSON.stringify(data);
									var log = new Log({user: owner, operation: 2, detail: detail});
									log.save(function(er, lg){
										if (er) return res.status(400).send({code: 400, message: er.message});

										return res.json({ table: {_id: id, owner, name, desc, module, active, friend, data, free} });
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


	server.delete('/api/delTable/:token/:id', function(req, res) {
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
						// verifico que no existan datos de la tabla
						DataTable.find({table: id}, function(errrr, datatables) {
							if (errrr) return res.status(400).send({code: 400, message: errrr.message});
							if (datatables.length > 0) return res.status(400).send({code: 400, message: 'Tabla con datos'});

							//elimino todos los campos de la tabla
							Field.deleteMany({table: id}, function(errr){
								if (errr) return res.status(400).send({code: 400, message: errr.message});

								Table.findByIdAndRemove(id, function(err){
									if (err) return res.status(400).send({code: 400, message: err.message});

									var detail = 'table:' + id.toString();
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

module.exports = tablesController;
