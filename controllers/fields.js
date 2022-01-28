var User = require('../models/user');
var Field = require('../models/field');
var Table = require('../models/table');
var DataTable = require('../models/datatable');
var Log = require('../models/log');

var fieldsController = function (server) {

	server.get('/api/getFields', function(req, res) {
		var token = '';
		if (typeof req.query.token !== 'undefined')
			token = req.query.token;

		if (token !== '') {

			User
				.find({token: token}, function(error, users) {
					if (error) return res.status(400).send({code: 400, message: error.message});
					if (users.length === 0) return res.status(400).send({code: 400, message: 'Usuario no encontrado'});

					var table = 0;
					if (typeof req.query.table !== 'undefined')
						table = req.query.table;

					Field.countDocuments({table: table}, function(err, count){
						if (err) return res.status(400).send({code: 400, message: err.message});

						var limit = 0;
						if (typeof req.query.limit !== 'undefined') limit = parseInt(req.query.limit, 10);
						if (limit === 0) limit = count;
						var skip = 0;
						if (typeof req.query.skip !== 'undefined') skip = parseInt(req.query.skip, 10);

						Field.find({table: table}).sort({name: 1}).skip(skip).limit(limit).exec(function(errr, fields) {
							if (errr) return res.status(400).send({code: 400, message: errr.message});

							return res.json({count: count, fields: fields});
						});
					});
				});
		} else {
			return res.json({count: 0, fields: []});
		}
	});

	server.get('/api/getTxtFields', function(req, res) {
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

					Table.find({active: true})
						.populate({
							path: 'friend',
							select: 'owner name desc active',
						})
						.populate({
							path: 'field',
							select: 'name desc',
							match: { kind: 'txt', obligatory: true }
						})
						.select('name desc owner')
						.exec(function(err, tables){
						if (err) return res.status(400).send({code: 400, message: err.message});

						var tbls = [];
						tables.forEach(function(t){
							if (t.field && (t.field.length > 0)) {
								if (t.owner.toString() === owner.toString()) tbls.push(t);
								else {
									for(var i = 0; i < t.friend.length; i++) {
										if (rol.indexOf(t.friend[i].toString()) > -1) {
											tbls.push(t);
										}
									}
								}
							}
						});

						return res.json({tables: tbls});
					});

				});
		} else {
			return res.json({tables: []});
		}
	});

	server.post('/api/addField/', function(req, res) {
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
						var kind = '';
						if (typeof req.body.kind !== 'undefined')
							kind = req.body.kind;
						var obligatory = false;
						if (typeof req.body.obligatory !== 'undefined')
							obligatory = req.body.obligatory;
						var value = '';
						if (typeof req.body.value !== 'undefined')
							value = req.body.value;
						var table = '';
						if (typeof req.body.table !== 'undefined')
							table = req.body.table;

						if ((name !== '') &&
							(desc !== '') &&
							(kind !== '') &&
							(table !== '')
							){

								// verifico que el field no exista en la tabla
								Field.find({table: table.toString(), name: name}, function(errr, fields){
									if (errr) return res.status(400).send({code: 400, message: errr.message});
									if (fields.length !== 0) return res.status(400).send({code: 400, message: 'Campo ya existe'});

									var field = new Field({name, desc, kind, obligatory, value, table});
									field.save(function(err, fld){
										if (err) return res.status(400).send({code: 400, message: err.message});

										var detail = 'field:' + name + ',' + desc + ',' + kind + ',' + obligatory + ',' + value + ',' + table;
										var log = new Log({user: owner, operation: 1, detail: detail});
										log.save(function(er, lg){
											if (er) return res.status(400).send({code: 400, message: er.message});

											Table.findByIdAndUpdate(table.toString(), { $push: { field: fld._id } }, function(errrr){
												if (errrr) return res.status(400).send({code: 400, message: errrr.message});

												return res.json({ field: fld });
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

	server.post('/api/updField/', function(req, res) {
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
					var kind = '';
					if (typeof req.body.kind !== 'undefined')
						kind = req.body.kind;
					var value = '';
					if (typeof req.body.value !== 'undefined')
						value = req.body.value;
					var desc = '';
					if (typeof req.body.desc !== 'undefined')
						desc = req.body.desc;
					var obligatory = false;
					if (typeof req.body.obligatory !== 'undefined')
						obligatory = req.body.obligatory;
					var table = '';
					if (typeof req.body.table !== 'undefined')
						table = req.body.table;

					if ((id !== '') &&
						(name !== '') &&
						(kind !== '') &&
						(table !== '') &&
						(desc !== '')
						){
							Field.find({table, name}, function(errr, fields){
								if (errr) return res.status(400).send({code: 400, message: errr.message});
								if ((fields.length > 1) || ((fields.length === 1) && (fields[0]._id.toString() !== id))) return res.status(400).send({code: 400, message: 'Campo ya existe'});

								Field.findOneAndUpdate({_id: id}, {$set: {name, kind, value, desc, obligatory}}, function(err, numReplaced){
									if (err) return res.status(400).send({code: 400, message: err.message});

									var detail = 'field:' + id + ',' + name + ',' + kind + ',' + value + ',' + desc + ',' + obligatory;
									var log = new Log({user: owner, operation: 2, detail: detail});
									log.save(function(er, lg){
										if (er) return res.status(400).send({code: 400, message: er.message});

										return res.json({ field: {_id: id, name, kind, value, desc, obligatory} });
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


	server.delete('/api/delField/:token/:id', function(req, res) {
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
						Field.findById(id, function (errr, fld){
							if (errr) return res.status(400).send({code: 400, message: errr.message});

							// verifico que el field no sea referencia de otra tabla
							Field.find({ kind: 'ref', value: {$regex: id, $options: 'i'}}, function(err, flds){
								if (err) return res.status(400).send({code: 400, message: err.message});
								if (flds.length > 0) return res.status(400).send({code: 400, message: 'Campo es referencia a otra tabla'});

								// verifico que no existan datos del campo
								DataTable.findOne({'values.field': id}, function(errorr, fldOne){
									if (errorr) return res.status(400).send({code: 400, message: errorr.message});

									if (fldOne !== null) {
										return res.status(400).send({code: 400, message: 'Campo con valores'});
									} else {
										//quito el campo de la tabla a que pertenece
										Table.findByIdAndUpdate(fld.table, { $pull: {field: id } }, function(e){
											if (e) return res.status(400).send({code: 400, message: e.message});

											// elimino el campo
											Field.findOneAndDelete({ _id: id }, function(errrr, fields){
												if (errrr) return res.status(400).send({code: 400, message: errrr.message});

												// guardo en el log
												var detail = 'field:' + id;
												var log = new Log({user: owner, operation: 3, detail: detail});
												log.save(function(er, lg){
													if (er) return res.status(400).send({code: 400, message: er.message});

													return res.json({ 'ok': true });
												});
											});

										});

									}
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

module.exports = fieldsController;
