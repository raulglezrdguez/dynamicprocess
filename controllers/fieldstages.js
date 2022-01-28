var User = require('../models/user');
var FieldStage = require('../models/fieldstage');
var Stage = require('../models/stage');
var Log = require('../models/log');

var fieldstageController = function (server) {

	server.get('/api/getFieldStages', function(req, res) {
		var token = '';
		if (typeof req.query.token !== 'undefined')
			token = req.query.token;

		if (token !== '') {

			User
				.find({token: token}, function(error, users) {
					if (error) return res.status(400).send({code: 400, message: error.message});
					if (users.length === 0) return res.status(400).send({code: 400, message: 'Usuario no encontrado'});

					var stage = 0;
					if (typeof req.query.stage !== 'undefined')
						stage = req.query.stage;

					FieldStage.countDocuments({stage: stage}, function(err, count){
						if (err) return res.status(400).send({code: 400, message: err.message});

						var limit = 0;
						if (typeof req.query.limit !== 'undefined') limit = parseInt(req.query.limit, 10);
						if (limit === 0) limit = count;
						var skip = 0;
						if (typeof req.query.skip !== 'undefined') skip = parseInt(req.query.skip, 10);

						FieldStage.find({stage: stage}).sort({name: 1}).skip(skip).limit(limit).exec(function(errr, fields) {
							if (errr) return res.status(400).send({code: 400, message: errr.message});

							return res.json({count: count, fields: fields});
						});
					});
				});
		} else {
			return res.json({count: 0, fields: []});
		}
	});

	server.post('/api/addFieldStage/', function(req, res) {
		var token = '';
		if (typeof req.body.token !== 'undefined')
			token = req.body.token;

		if (token !== '') {

			User
				.find({token: token}, function(error, users){
					if (error) return res.status(400).send({code: 400, message: error.message});
					if (users.length === 0) return res.status(400).send({code: 400, message: 'Usuario no encontrado'});

          	var iduser = users[0]._id;

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
						var stage = '';
						if (typeof req.body.stage !== 'undefined')
							stage = req.body.stage;

						if ((name !== '') &&
							(desc !== '') &&
							(kind !== '') &&
							(stage !== '')
							){

								// verifico que el fieldstage no exista en la etapa
								FieldStage.find({stage: stage.toString(), name: name}, function(errr, fields){
									if (errr) return res.status(400).send({code: 400, message: errr.message});
									if (fields.length !== 0) return res.status(400).send({code: 400, message: 'Campo ya existe'});

									var field = new FieldStage({name, desc, kind, obligatory, value, stage});
									field.save(function(err, fld){
										if (err) return res.status(400).send({code: 400, message: err.message});

										var detail = 'fieldstage:' + name + ',' + desc + ',' + kind + ',' + obligatory + ',' + value + ',' + stage;
										var log = new Log({user: iduser, operation: 1, detail: detail});
										log.save(function(er, lg){
											if (er) return res.status(400).send({code: 400, message: er.message});

											Stage.findByIdAndUpdate(stage.toString(), { $push: { field: fld._id } }, function(errrr){
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

	server.post('/api/updFieldStage/', function(req, res) {
		var token = '';
		if (typeof req.body.token !== 'undefined')
			token = req.body.token;

		if (token !== '') {

			User
				.find({token}, function(error, users){
					if (error) return res.status(400).send({code: 400, message: error.message});
					if (users.length === 0) return res.status(400).send({code: 400, message: 'Usuario no encontrado'});

					var iduser = users[0]._id;

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
					var stage = '';
					if (typeof req.body.stage !== 'undefined')
						stage = req.body.stage;

					if ((id !== '') &&
						(name !== '') &&
						(kind !== '') &&
						(stage !== '') &&
						(desc !== '')
						){
							FieldStage.find({stage, name}, function(errr, fields){
								if (errr) return res.status(400).send({code: 400, message: errr.message});
								if ((fields.length > 1) || ((fields.length === 1) && (fields[0]._id.toString() !== id))) return res.status(400).send({code: 400, message: 'Campo ya existe'});

								FieldStage.findOneAndUpdate({_id: id}, {$set: {name, kind, value, desc, obligatory}}, function(err, numReplaced){
									if (err) return res.status(400).send({code: 400, message: err.message});

									var detail = 'fieldstage:' + id + ',' + name + ',' + kind + ',' + value + ',' + desc + ',' + obligatory;
									var log = new Log({user: iduser, operation: 2, detail: detail});
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


	server.delete('/api/delFieldStage/:token/:id', function(req, res) {
		var token = '';
		if (typeof req.params.token !== 'undefined')
			token = req.params.token;

		if (token !== '') {

			User
				.find({token}, function(error, users){
					if (error) return res.status(400).send({code: 400, message: error.message});
					if (users.length === 0) return res.status(400).send({code: 400, message: 'Usuario no encontrado'});

					var iduser = users[0]._id;

					var id = '';
					if (typeof req.params.id !== 'undefined')
						id = req.params.id;

					if (id !== ''){
						FieldStage.findById(id, function (errr, fld){
							if (errr) return res.status(400).send({code: 400, message: errr.message});

							//quito el campo de la etapa a que pertenece
							Stage.findByIdAndUpdate(fld.stage, { $pull: {field: id } }, function(e){
								if (e) return res.status(400).send({code: 400, message: e.message});

								// elimino el campo
								FieldStage.findOneAndDelete({ _id: id }, function(errrr, fields){
									if (errrr) return res.status(400).send({code: 400, message: errrr.message});

									// guardo en el log
									var detail = 'fieldstage:' + id;
									var log = new Log({user: iduser, operation: 3, detail: detail});
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

module.exports = fieldstageController;
