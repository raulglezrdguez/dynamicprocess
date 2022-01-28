var fs = require('fs');
var mongoose = require('mongoose');
var User = require('../models/user');
var Module = require('../models/module');
var Rol = require('../models/rol');
var FieldStage = require('../models/fieldstage');
var Process = require('../models/process');
var Stage = require('../models/stage');
var DataStage = require('../models/datastage');
var Log = require('../models/log');
var config = require('../config.js');

var datastageController = function (server) {
  // los procesos en los que el usuario puede ver o editar datos
  server.get('/api/getDataProcess', function(req, res) {
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

          var search = {};
          if (typeof req.query.active !== 'undefined')
      			search.active = req.query.active === 'true';

					Process.find(search)
						.populate({path: 'tprocess', select: 'name'})
						.populate({
							path: 'friend',
							select: 'active',
						})
						.populate({
							path: 'data',
							select: 'active',
						})
						.populate({path: 'firststage', select: 'name desc'})
						// .populate({path: 'stage', select: 'name desc active rol rolstage', populate: {path: 'field'}})
						.populate({path: 'stage', select: 'name desc active rol', populate: {path: 'field'}})
						.exec(function(err, process) {
						if (err) return res.status(400).send({code: 400, message: err.message});

						// var prcs = process.filter(p => (
            //   (p.owner.toString() === owner) || // sea el dueño del proceso
            //   (p.friend.some(f => (rol.indexOf(f._id) > -1))) || // sea amigo del proceso
            //   (p.data.some(f => (rol.indexOf(f._id) > -1))) || // pueda ver datos del proceso
            //   (p.stage.some(s => (s.rol.some(r => (rol.indexOf(r._id) > -1))))) // tenga permisos para entrar datos en alguna etapa del proceso
            // ));
            var prcs = [];
            process.forEach(function(p) {
              var fullControl = ((p.owner.toString() === owner) || // sea el dueño del proceso
                                (p.friend.some(f => (rol.indexOf(f._id) > -1)))); // sea amigo del proceso
              var readData = p.data.some(f => (rol.indexOf(f._id) > -1)); // pueda ver datos del proceso
              var writeData = p.stage.some(s => (s.rol.some(r => (rol.indexOf(r._id) > -1)))); // tenga permisos para entrar datos en alguna etapa del proceso
              if (fullControl || readData || writeData) {
                prcs.push({
                  active: p.active,
                  stage: p.stage,
                  date: p.date,
                  _id: p._id,
                  owner: p.owner,
                  name: p.name,
                  desc: p.desc,
                  tprocess: p.tprocess,
                  firststage: p.firststage,
                  permission: {full: fullControl, read: readData, write: writeData}
                  });
              }
            });
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

  // devuelve las etapas de un proceso en las que el usuario puede ver o editar sus datos
  server.get('/api/getDatasStage', function(req, res) {
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

          var process = '';
      		if (typeof req.query.process !== 'undefined')
      			process = req.query.process.trim();

          if (process !== '') {
  					Process.findById(process)
  						.populate({
  							path: 'friend',
  							select: 'active',
  						})
  						.populate({
  							path: 'data',
  							select: 'active',
  						})
  						.populate({path: 'stage', select: 'rol'})
  						.exec(function(err, theprocess) {
  						if (err) return res.status(400).send({code: 400, message: err.message});

              if (theprocess) {
                var fulldata = (theprocess.owner === owner) || // es el dueño
                              (theprocess.friend.some(f => (rol.indexOf(f._id) > -1))) || // es amigo
                              (theprocess.data.some(f => (rol.indexOf(f._id) > -1))); // puede ver datos
                var cont = (theprocess.stage.some(s => (s.rol.some(r => (rol.indexOf(r._id) > -1))))); // tenga permisos para entrar datos en alguna etapa del proceso
                if (fulldata || cont) {
                  DataStage.find({stage: theprocess.stage})
                    .populate({path: 'next', select: 'active name desc rol rolstage'})
                    .populate({
                      path: 'stage',
                      // select: 'active name rol rolstage',
                      select: 'active name rol',
                      populate: {
                        path: 'field'
                      }
                    })
                    .populate({
                      path: 'stage',
                      populate: {
                        path: 'next'
                      }
                    })
                    .populate({path: 'values', select: 'field value'})
                    .populate('values.field')
                    .sort({register: -1, date: -1})
                    .exec(function(errr, stages) {
                      if (errr) return res.status(400).send({code: 400, message: errr.message});

                      // ordeno los stages por register
                      var rows = [];
                      if (stages) {
                        stages.forEach(function(s) {
                          var rw = rows.find(function(r) {
                            return (r.register.toString() === s.register.toString());
                          });
                          rw ? rw.stages.push(s) : rows.push({register: s.register, stages: [s]});
                        });
                      }

                      var count = rows.length;

                      var limit = 0;
                      if (typeof req.query.limit !== 'undefined') limit = parseInt(req.query.limit, 10);
                      if (limit === 0) limit = count;
                      var skip = 0;
                      if (typeof req.query.skip !== 'undefined') skip = parseInt(req.query.skip, 10);

                      if (skip > 0) rows.splice(0, skip);
                      if (limit < rows.length) rows.splice(limit, rows.length);

                      return res.json({count, stages: rows});
                    });
                } else {
                  return res.json({count: 0, stages: []});
                }
              } else {
                return res.json({count: 0, stages: []});
              }
  					});
          } else {
            return res.json({count: 0, stages: []});
          }
				});
		} else {
			return res.json({count: 0, stages: []});
		}
	});

  // adiciono un registro de datos a una etapa
  server.post('/api/addDatasStage/', function(req, res) {
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

          var register = '';
          if (typeof req.body.register !== 'undefined') {
            register = req.body.register.trim();
          }
          if (register === '') register = mongoose.Types.ObjectId();
          var stage = '';
          if (typeof req.body.stage !== 'undefined') {
            stage = req.body.stage.trim();
          }
          var next = null;
          if (typeof req.body.next !== 'undefined') {
            next = req.body.next;
          }
          var values = [];
          if (typeof req.body.values !== 'undefined') {
            values = req.body.values;
          }

          if ((register !== '') && (stage !== '')) {
              // verifico que la etapa exista
              Stage.findById(stage, function(errr, stg) {
                if (errr) return res.status(400).send({code: 400, message: errr.message});
                if (stg === null) return res.status(400).send({code: 400, message: 'Etapa no existe'});

                var dtstg = new DataStage({register, stage, owner, next, values});
                dtstg.save(function(err, datastage) {
                  if (err) return res.status(400).send({code: 400, message: err.message});

                  var detail = 'datastage:' + stage + ',' + register + ',' + next + ',' + JSON.stringify(values);
                  var log = new Log({user: owner, operation: 1, detail: detail});
                  log.save(function(er, lg) {
                    if (er) return res.status(400).send({code: 400, message: er.message});

                    return res.json({ datastage });
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

  server.post('/api/updDatasStage/', function(req, res) {
		var token = '';
		if (typeof req.body.token !== 'undefined') {
			token = req.body.token.trim();
		}

		if (token !== '') {

			User
				.find({token}, function(error, users) {
					if (error) return res.status(400).send({code: 400, message: error.message});
					if (users.length === 0) return res.status(400).send({code: 400, message: 'Usuario no encontrado'});

					var owner = users[0]._id;

					var id = '';
					if (typeof req.body.id !== 'undefined') {
						id = req.body.id.trim();
					}
          var next = null;
          if (typeof req.body.next !== 'undefined') {
            next = req.body.next;
          }
					var values = [];
					if (typeof req.body.values !== 'undefined') {
						values = req.body.values;
					}

					if ((id !== '') && (values.length > 0)) {
								DataStage.findOneAndUpdate({_id: id}, {$set: {owner, next, values}}, function(err, numReplaced) {
									if (err) return res.status(400).send({code: 400, message: err.message});

									var detail = 'datastage:' + id + ',' + next + ','+ JSON.stringify(values);
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

  // puede editar los datos de la etapa si es el dueño de los datos
  server.get('/api/canEditStage', function(req, res) {
		var token = '';
		if (typeof req.query.token !== 'undefined')
			token = req.query.token.trim();
    var stage = '';
    if (typeof req.query.stage !== 'undefined')
      stage = req.query.stage.trim();

		if ((token !== '') && (stage !== '')) {

			User
				.find({token: token}, function(error, users) {
					if (error) return res.status(400).send({code: 400, message: error.message});
					if (users.length === 0) return res.status(400).send({code: 400, message: 'Usuario no encontrado'});

					var owner = users[0]._id.toString();

          DataStage.findById(stage)
          .select('owner')
            .exec(function(errr, thestage) {
              if (errr) return res.status(400).send({code: 400, message: errr.message});

              if (thestage && (thestage.owner === owner)) return res.json({ok: true});
              else return res.json({ok: false});
            });
				});
		} else {
			return res.json({ok: false});
		}
	});

  // puede adicionar los datos de la etapa
  // si tiene permisos para escribir en la etapa (rol), o
  // si ejecutó otra etapa (rolstage)
  server.get('/api/canAddStage', function(req, res) {
		var token = '';
		if (typeof req.query.token !== 'undefined')
			token = req.query.token.trim();
    var stage = '';
    if (typeof req.query.stage !== 'undefined')
      stage = req.query.stage.trim();
    var register = '';
    if (typeof req.query.register !== 'undefined')
      register = req.query.register.trim();

		if ((token !== '') && (stage !== '')) {

			User
				.find({token: token}, function(error, users) {
					if (error) return res.status(400).send({code: 400, message: error.message});
					if (users.length === 0) return res.status(400).send({code: 400, message: 'Usuario no encontrado'});

					var owner = users[0]._id.toString();
					var rol = users[0].rol;

          Stage.findById(stage)
            .select('rol rolstage')
            .exec(function(errr, thestage) {
              if (errr) return res.status(400).send({code: 400, message: errr.message});

              var canAddXRol = thestage.rol.some(function(r) {return (rol.indexOf(r) !== -1)});
              if (canAddXRol) {
                return res.json({ok: true});
              } else if (register && (thestage.rolstage.length > 0)) {
                DataStage.findOne({register: register, stage: thestage.rolstage, owner: owner}, function(err, dt) {
                  if (err) return res.status(400).send({code: 400, message: err.message});

                  if (dt) {
                    return res.json({ok: true});
                  } else {
                    return res.json({ok: false});
                  }
                });
              } else {
                return res.json({ok: false});
              }

            });
				});
		} else {
			return res.json({ok: false});
		}
	});

  server.delete('/api/delDatasStage/:token/:id', function(req, res) {
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
            // verifico que no sea una etapa intermedia
            DataStage.findById(id, function(err, datastage) {
              if (err) return res.status(400).send({code: 400, message: err.message});

              var register = datastage.register;
              var next = datastage.next;
              if (register && next) {
                // verifico que no existan datos con next y register
                DataStage.find({register: register, stage: next}, function(errr, dts) {
                  if (errr) return res.status(400).send({code: 400, message: errr.message});
                  if (dts.length !== 0) return res.status(400).send({code: 400, message: 'No es última etapa'});

                  // elimino
                  DataStage.findOneAndDelete({ _id: id }, function(errrr, ds){
                    if (errrr) return res.status(400).send({code: 400, message: errrr.message});

                    // guardo en el log
                    var detail = 'datastage:' + id;
                    var log = new Log({user: owner, operation: 3, detail: detail});
                    log.save(function(er, lg){
                      if (er) return res.status(400).send({code: 400, message: er.message});

                      return res.json({ 'ok': true });
                    });
                  });
                });
              } else {
                // elimino
                DataStage.findOneAndDelete({ _id: id }, function(errrr, ds){
                  if (errrr) return res.status(400).send({code: 400, message: errrr.message});

                  // guardo en el log
                  var detail = 'datastage:' + id;
                  var log = new Log({user: owner, operation: 3, detail: detail});
                  log.save(function(er, lg){
                    if (er) return res.status(400).send({code: 400, message: er.message});

                    return res.json({ 'ok': true });
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

  server.delete('/api/delDatasRegister/:token/:id', function(req, res) {
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
            // elimino
            DataStage.deleteMany({ register: id }, function(errrr){
              if (errrr) return res.status(400).send({code: 400, message: errrr.message});

              // guardo en el log
              var detail = 'datasregister:' + id;
              var log = new Log({user: owner, operation: 3, detail: detail});
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

}

module.exports = datastageController;
