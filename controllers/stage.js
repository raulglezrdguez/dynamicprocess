var User = require('../models/user');
var Stage = require('../models/stage');
var Process = require('../models/process');
var Log = require('../models/log');

var stageController = function (server) {

	server.get('/api/getStage', function(req, res) {
		var token = '';
		if (typeof req.query.token !== 'undefined')
			token = req.query.token;

		if (token !== '') {

			User
				.find({token: token}, function(error, users) {
					if (error) return res.status(400).send({code: 400, message: error.message});
					if (users.length === 0) return res.status(400).send({code: 400, message: 'Usuario no encontrado'});

					var process = 0;
					if (typeof req.query.process !== 'undefined')
						process = req.query.process;

					Process.findById(process, function(errror, theProcess){
						if (errror) return res.status(400).send({code: 400, message: errror.message});

						var search = {process: process};
						if (typeof req.query.active !== 'undefined')
							search.active = req.query.active;

						Stage.countDocuments(search, function(err, count){
							if (err) return res.status(400).send({code: 400, message: err.message});

							var limit = 0;
							if (typeof req.query.limit !== 'undefined') limit = parseInt(req.query.limit, 10);
							if (limit === 0) limit = count;
							var skip = 0;
							if (typeof req.query.skip !== 'undefined') skip = parseInt(req.query.skip, 10);

							Stage.find(search)
								.populate({
									path: 'rol',
									select: 'owner name desc active',
									populate: {
										path: 'module',
										select: 'owner name desc active'
									}
								})
								.populate({
									path: 'rolstage',
									select: 'name desc',
									populate: {
										path: 'process',
										select: 'owner name desc active'
									}
								})
								.populate({path: 'field', select: 'name kind value desc obligatory'})
								.populate({path: 'next', select: 'name desc process'})
								.sort({name: 1})
								.skip(skip)
								.limit(limit)
								.exec(function(errr, stages) {
								if (errr) return res.status(400).send({code: 400, message: errr.message});

								return res.json({count: count, firststage: theProcess.firststage, stage: stages});
							});
						});

					});
				});
		} else {
			return res.json({count: 0, firststage: '', stage: []});
		}
	});

	server.get('/api/getTheStage', function(req, res) {
		var token = '';
		if (typeof req.query.token !== 'undefined')
			token = req.query.token;

		if (token !== '') {

			User
				.find({token: token}, function(error, users) {
					if (error) return res.status(400).send({code: 400, message: error.message});
					if (users.length === 0) return res.status(400).send({code: 400, message: 'Usuario no encontrado'});

					var stage = '';
					if (typeof req.query.stage !== 'undefined')
						stage = req.query.stage.trim();

					if (stage !== '') {
						Stage.findById(stage)
						.populate({path: 'process', select: 'name tprocess active firststage'})
						.populate({path: 'field', select: 'name kind value obligatory'})
						.populate({path: 'next', select: 'name desc process'})
						.exec(function(err, thestage) {
							if (err) return res.status(400).send({code: 400, message: err.message});

							return res.json({stage: thestage});
						});
					} else {
						return res.json({stage: {}});
					}
				});
		} else {
			return res.json({stage: {}});
		}
	});

	server.post('/api/addStage/', function(req, res) {
		var token = '';
		if (typeof req.body.token !== 'undefined')
			token = req.body.token;

		if (token !== '') {

			User
				.find({token: token}, function(error, users){
					if (error) return res.status(400).send({code: 400, message: error.message});
					if (users.length === 0) return res.status(400).send({code: 400, message: 'Usuario no encontrado'});

          	var owner = users[0]._id;

						var process = '';
						if (typeof req.body.process !== 'undefined')
							process = req.body.process.trim();
						var name = '';
						if (typeof req.body.name !== 'undefined')
							name = req.body.name.trim();
						var desc = '';
						if (typeof req.body.desc !== 'undefined')
							desc = req.body.desc.trim();
						var rol = [];
						if (typeof req.body.rol !== 'undefined')
							rol = req.body.rol;
						var rolstage = [];
						if (typeof req.body.rolstage !== 'undefined')
							rolstage = req.body.rolstage;
						var next = [];
						if (typeof req.body.next !== 'undefined')
							next = req.body.next;
						var active = false;
						if (typeof req.body.active !== 'undefined')
							active = req.body.active;

						// var datefrom = 0;
						// if (typeof req.body.datefrom !== 'undefined')
						// 	datefrom = req.body.datefrom;
						// var dateto = 0;
						// if (typeof req.body.dateto !== 'undefined')
						// 	dateto = req.body.dateto;

						if ((process !== '') &&
							(name !== '') &&
							(desc !== '')
							){

								// verifico que la etapa no exista en el proceso
								Stage.find({process: process, name: name}, function(errr, stages){
									if (errr) return res.status(400).send({code: 400, message: errr.message});
									if (stages.length !== 0) return res.status(400).send({code: 400, message: 'Etapa ya existe'});

									// var stage = new Stage({process, name, desc, rol, rolstage, next, datefrom, dateto});
									var stage = new Stage({process, name, desc, rol, rolstage, next, active});
									stage.save(function(err, stg){
										if (err) return res.status(400).send({code: 400, message: err.message});

										// var detail = 'stage:' + process + ',' + name + ',' + desc + ',' + JSON.stringify(rol) + ',' + JSON.stringify(rolstage) + ',' + JSON.stringify(next) + ',' + datefrom + ',' + dateto;
										var detail = 'stage:' + process + ',' + name + ',' + desc + ',' + JSON.stringify(rol) + ',' + JSON.stringify(rolstage) + ',' + JSON.stringify(next) + ',' + active;
										var log = new Log({user: owner, operation: 1, detail: detail});
										log.save(function(er, lg){
											if (er) return res.status(400).send({code: 400, message: er.message});

											Process.findById(process, function(erorr, prc){
												if (erorr) return res.status(400).send({code: 400, message: erorr.message});

												var toUpd = { $push: { stage: stg._id } };
												if (!prc.firststage) toUpd.firststage = stg._id;
												Process.findByIdAndUpdate(process, toUpd, function(errrr){
													if (errrr) return res.status(400).send({code: 400, message: errrr.message});

													return res.json({ stage: stg });
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

	server.post('/api/updStage/', function(req, res) {
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
					var process = '';
					if (typeof req.body.process !== 'undefined')
						process = req.body.process;
					var rol = [];
					if (typeof req.body.rol !== 'undefined')
						rol = req.body.rol;
					var rolstage = [];
					if (typeof req.body.rolstage !== 'undefined')
						rolstage = req.body.rolstage;
					var next = [];
					if (typeof req.body.next !== 'undefined')
						next = req.body.next;
					var active = false;
					if (typeof req.body.active !== 'undefined')
						active = req.body.active;

          // var datefrom = 0;
					// if (typeof req.body.datefrom !== 'undefined')
					// 	datefrom = req.body.datefrom;
					// var dateto = 0;
					// if (typeof req.body.dateto !== 'undefined')
					// 	dateto = req.body.dateto;

					if ((id !== '') &&
						(name !== '') &&
						(process !== '') &&
						(desc !== '')
						){
							Stage.find({process, name}, function(errr, stages){
								if (errr) return res.status(400).send({code: 400, message: errr.message});
								if ((stages.length > 1) || ((stages.length === 1) && (stages[0]._id.toString() !== id))) return res.status(400).send({code: 400, message: 'Etapa ya existe'});

								// Stage.findOneAndUpdate({_id: id}, {$set: {name, desc, rol, rolstage, next, datefrom, dateto}}, function(err, numReplaced){
								Stage.findOneAndUpdate({_id: id}, {$set: {name, desc, rol, rolstage, next, active}}, function(err, numReplaced){
									if (err) return res.status(400).send({code: 400, message: err.message});

									// var detail = 'stage:' + id + ',' + name + ',' + desc + ',' + JSON.stringify(rol) + ',' + JSON.stringify(rolstage) + ',' + JSON.stringify(next) + ',' + datefrom + ',' + dateto;
									var detail = 'stage:' + id + ',' + name + ',' + desc + ',' + JSON.stringify(rol) + ',' + JSON.stringify(rolstage) + ',' + JSON.stringify(next) + ',' + active;
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

	server.delete('/api/delStage/:token/:id', function(req, res) {
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
						// verifico que la etapa no sea la primera
						Process.find({firststage: id}, function(errorr, fsProcess) {
							if (errorr) return res.status(400).send({code: 400, message: errorr.message});
							if (fsProcess.length > 0) return res.status(400).send({code: 400, message: 'Primera etapa de proceso'});

							Stage.findById(id, function (errr, fld){
								if (errr) return res.status(400).send({code: 400, message: errr.message});

								// verifico que la etapa no tenga valores

								// verifico que la etapa no sea referencia de otra etapa

								// quito la etapa del proceso a que pertenece
								Process.findByIdAndUpdate(fld.process, { $pull: {stage: id } }, function(e){
									if (e) return res.status(400).send({code: 400, message: e.message});

									// elimino la etapa
									Stage.findOneAndDelete({ _id: id }, function(errrr, stage){
										if (errrr) return res.status(400).send({code: 400, message: errrr.message});

										// guardo en el log
										var detail = 'stage:' + id;
										var log = new Log({user: owner, operation: 3, detail: detail});
										log.save(function(er, lg){
											if (er) return res.status(400).send({code: 400, message: er.message});

											return res.json({ 'ok': true });
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

module.exports = stageController;
