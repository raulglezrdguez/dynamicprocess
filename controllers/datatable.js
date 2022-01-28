var fs = require('fs');
var mongoose = require('mongoose');
var User = require('../models/user');
var Module = require('../models/module');
var Rol = require('../models/rol');
var Field = require('../models/field');
var Table = require('../models/table');
var DataTable = require('../models/datatable');
var Log = require('../models/log');
var config = require('../config.js');

var datatablesController = function (server) {

	// datos de la tabla que puede editar el usuario
	server.get('/api/getDatasTable', function(req, res) {
		var token = '';
		if (typeof req.query.token !== 'undefined') {
			token = req.query.token.trim();
		}
		var table = '';
		if (typeof req.query.table !== 'undefined') {
			table = req.query.table.trim();
		}

		if ((token !== '') && (table !== '')){

			User
				.find({token: token}, function(error, users) {
					if (error) return res.status(400).send({code: 400, message: error.message});
					if (users.length === 0) return res.status(400).send({code: 400, message: 'Usuario no encontrado'});

					var owner = users[0]._id;
					var rol = users[0].rol;

					Table.findById(mongoose.Types.ObjectId(table)).exec(function(err, tables){
						if (err) return res.status(400).send({code: 400, message: err.message});

            var fulldata = (tables.owner.toString() === owner.toString());
						if (!fulldata){
							fulldata = rol.some(r => (tables.friend.indexOf(r) > -1));
						}

            DataTable
							.find({table: mongoose.Types.ObjectId(table)})
							.populate({
								path: 'table',
								populate: {path: 'field'}
							})
							.populate('values.field')
							.exec(function(errr, datas) {
              if (errr) return res.status(400).send({code: 400, message: errr.message});

              var dts = [];
              if (fulldata) dts = datas;
              else {
								dts = datas.filter(function(d){ return (d.owner.toString() === owner.toString())});
              }

              var count = dts.length;

              var limit = 0;
              if (typeof req.query.limit !== 'undefined') limit = parseInt(req.query.limit, 10);
              if (limit === 0) limit = count;
              var skip = 0;
              if (typeof req.query.skip !== 'undefined') skip = parseInt(req.query.skip, 10);

              if (skip > 0) dts.splice(0, skip);
              if (limit < dts.length) dts.splice(limit, dts.length);

              return res.json({count: count, datas: dts});
            });
					});
				});
		} else {
			return res.json({datas: []});
		}
	});

	// datos de la tabla publica que esten activas
	server.get('/api/getPublicDatas', function(req, res) {
		var table = '';
		if (typeof req.query.table !== 'undefined') {
			table = req.query.table.trim();
		}

		if (table !== '') {

					Table.find({_id: mongoose.Types.ObjectId(table), free: true, active: true}).exec(function(err, tables){
						if (err) return res.status(400).send({code: 400, message: err.message});
						if (tables.length !== 1) return res.status(400).send({code: 400, message: 'Tabla publica no existe'});

            DataTable
							.find({table: mongoose.Types.ObjectId(table)})
							.populate({
								path: 'table',
								populate: {path: 'field'}
							})
							.populate('values.field')
							.exec(function(errr, datas){
              if (errr) return res.status(400).send({code: 400, message: errr.message});

              var count = datas.length;

              var limit = 0;
              if (typeof req.query.limit !== 'undefined') limit = parseInt(req.query.limit, 10);
              if (limit === 0) limit = count;
              var skip = 0;
              if (typeof req.query.skip !== 'undefined') skip = parseInt(req.query.skip, 10);

              if (skip > 0) datas.splice(0, skip);
              if (limit < datas.length) datas.splice(limit, datas.length);

              return res.json({count: count, datas: datas});
            });
					});
				}
	});

	// resumen de los datos de la tabla
	server.get('/api/getSummaryDatas', function(req, res) {
		var token = '';
		if (typeof req.query.token !== 'undefined') {
			token = req.query.token.trim();
		}
		var table = '';
		if (typeof req.query.table !== 'undefined') {
			table = req.query.table.trim();
		}

		if ((token !== '') && (table !== '')){

			User
				.find({token: token}, function(error, users) {
					if (error) return res.status(400).send({code: 400, message: error.message});
					if (users.length === 0) return res.status(400).send({code: 400, message: 'Usuario no encontrado'});

					var owner = users[0]._id;
					var rol = users[0].rol;

					Table.findById(mongoose.Types.ObjectId(table)).exec(function(err, tables){
						if (err) return res.status(400).send({code: 400, message: err.message});

						var fulldata = (tables.owner.toString() === owner.toString());
						if (!fulldata){
							fulldata = rol.some(r => (tables.friend.indexOf(r) > -1));
						}

            DataTable
							.find({table: mongoose.Types.ObjectId(table)})
							.populate('values.field')
							.exec(function(errr, datas){
              if (errr) return res.status(400).send({code: 400, message: errr.message});

              var dts = [];
              if (fulldata) dts = datas;
              else {
								dts = datas.filter(function(d){ return (d.owner.toString() === owner.toString())});
              }

							var sum = {};
							var dt = [];
							var d = null;
							dts.forEach(function(d){
								d.values.forEach(function(v){
									switch(v.field.kind){
										case 'txt':
										case 'img':
										case 'fle':
											if (v.value.trim()) {
												if (sum[v.field.name]) {
													sum[v.field.name]['count'] += 1;
												} else {
													sum[v.field.name] = {type: v.field.kind};
													sum[v.field.name]['count'] = 1;
												}
											}
										break;
										case 'num':
											if (v.value) {
												if (sum[v.field.name]) {
													sum[v.field.name]['sum'] += parseFloat(v.value);
													sum[v.field.name]['count'] += 1;
												} else {
													sum[v.field.name] = {type: 'num'};
													sum[v.field.name]['sum'] = parseFloat(v.value);
													sum[v.field.name]['count'] = 1;
												}
											}
										break;
										case 'bln':
											if ((v.value === true) || (v.value === 'true')) {
												if (sum[v.field.name]) {
													sum[v.field.name]['true'] += 1;
												} else {
													sum[v.field.name] = {type: 'bln'};
													sum[v.field.name]['true'] = 1;
													sum[v.field.name]['false'] = 0;
												}
											} else {
												if (sum[v.field.name]) {
													sum[v.field.name]['false'] += 1;
												} else {
													sum[v.field.name] = {type: 'bln'};
													sum[v.field.name]['false'] = 1;
													sum[v.field.name]['true'] = 0;
												}
											}
										break;
										case 'lst':
											if (v.value) {
												if (sum[v.field.name]) {
													sum[v.field.name]['count'] += 1;
													sum[v.field.name][v.value] += 1;
												} else {
													sum[v.field.name] = {type: 'lst'};
													sum[v.field.name]['count'] = 1;
													dt = v.field.value.split(',').map(s => s.trim()).filter(s => s.length);
													dt.forEach(function(f){
														if (f === v.value) sum[v.field.name][f] = 1;
														else sum[v.field.name][f] = 0;
													});
												}
											}
										break;
										case 'dte':
											if (v.value) {
												if (sum[v.field.name]) {
													sum[v.field.name]['count'] += 1;
													dt = v.value.split('-');
													d = new Date(dt[2], dt[1], dt[0]);
													if (sum[v.field.name]['min'] > d) sum[v.field.name]['min'] = d;
													if (sum[v.field.name]['max'] < d) sum[v.field.name]['max'] = d;
												} else {
													sum[v.field.name] = {type: 'dte'};
													sum[v.field.name]['count'] = 1;
													dt = v.value.split('-');
													d = new Date(dt[2], dt[1], dt[0]);
													sum[v.field.name]['min'] =  d;
													sum[v.field.name]['max'] = d;
												}
											}
										break;
										case 'tme':
											if (v.value) {
												if (sum[v.field.name]) {
													sum[v.field.name]['count'] += 1;
													dt = v.value.split(':');
													d = sum[v.field.name]['min'].split(':');
													if (parseInt(d[0]) > parseInt(dt[0])) sum[v.field.name]['min'] =  v.value;
													else if ((parseInt(d[0]) === parseInt(dt[0])) && (parseInt(d[1]) > parseInt(dt[1]))) sum[v.field.name]['min'] =  v.value;
													else {
														d = sum[v.field.name]['max'].split(':');
														if (parseInt(d[0]) < parseInt(dt[0])) sum[v.field.name]['max'] =  v.value;
														else if ((parseInt(d[0]) === parseInt(dt[0])) && (parseInt(d[1]) < parseInt(dt[1]))) sum[v.field.name]['max'] =  v.value;
													}
												} else {
													sum[v.field.name] = {type: 'tme'};
													sum[v.field.name]['count'] = 1;
													sum[v.field.name]['min'] =  v.value;
													sum[v.field.name]['max'] = v.value;
												}
											}
										break;
									}
								});
							});

              return res.json({count: dts.length, sum});
            });
					});
				});
		} else {
			return res.json({count: 0, sum: []});
		}
	});

	// resumen de los datos de la tabla publica
	server.get('/api/getSummaryPublicDatas', function(req, res) {
		var table = '';
		if (typeof req.query.table !== 'undefined') {
			table = req.query.table.trim();
		}

		if (table !== '') {

					Table.find({_id: mongoose.Types.ObjectId(table), free: true, active: true}).exec(function(err, tables){
						if (err) return res.status(400).send({code: 400, message: err.message});
						if (tables.length !== 1) return res.status(400).send({code: 400, message: 'Tabla pública no encontrada'});

            DataTable
							.find({table: mongoose.Types.ObjectId(table)})
							.populate('values.field')
							.exec(function(errr, datas){
              if (errr) return res.status(400).send({code: 400, message: errr.message});

							var sum = {};
							var dt = [];
							var d = null;
							datas.forEach(function(d){
								d.values.forEach(function(v){
									switch(v.field.kind){
										case 'txt':
										case 'img':
										case 'fle':
											if (v.value.trim()) {
												if (sum[v.field.name]) {
													sum[v.field.name]['count'] += 1;
												} else {
													sum[v.field.name] = {type: v.field.kind};
													sum[v.field.name]['count'] = 1;
												}
											}
										break;
										case 'num':
											if (v.value) {
												if (sum[v.field.name]) {
													sum[v.field.name]['sum'] += parseFloat(v.value);
													sum[v.field.name]['count'] += 1;
												} else {
													sum[v.field.name] = {type: 'num'};
													sum[v.field.name]['sum'] = parseFloat(v.value);
													sum[v.field.name]['count'] = 1;
												}
											}
										break;
										case 'bln':
											if ((v.value === true) || (v.value === 'true')) {
												if (sum[v.field.name]) {
													sum[v.field.name]['true'] += 1;
												} else {
													sum[v.field.name] = {type: 'bln'};
													sum[v.field.name]['true'] = 1;
													sum[v.field.name]['false'] = 0;
												}
											} else {
												if (sum[v.field.name]) {
													sum[v.field.name]['false'] += 1;
												} else {
													sum[v.field.name] = {type: 'bln'};
													sum[v.field.name]['false'] = 1;
													sum[v.field.name]['true'] = 0;
												}
											}
										break;
										case 'lst':
											if (v.value) {
												if (sum[v.field.name]) {
													sum[v.field.name]['count'] += 1;
													sum[v.field.name][v.value] += 1;
												} else {
													sum[v.field.name] = {type: 'lst'};
													sum[v.field.name]['count'] = 1;
													dt = v.field.value.split(',').map(s => s.trim()).filter(s => s.length);
													dt.forEach(function(f){
														if (f === v.value) sum[v.field.name][f] = 1;
														else sum[v.field.name][f] = 0;
													});
												}
											}
										break;
										case 'dte':
											if (v.value) {
												if (sum[v.field.name]) {
													sum[v.field.name]['count'] += 1;
													dt = v.value.split('-');
													d = new Date(dt[2], dt[1], dt[0]);
													if (sum[v.field.name]['min'] > d) sum[v.field.name]['min'] = d;
													if (sum[v.field.name]['max'] < d) sum[v.field.name]['max'] = d;
												} else {
													sum[v.field.name] = {type: 'dte'};
													sum[v.field.name]['count'] = 1;
													dt = v.value.split('-');
													d = new Date(dt[2], dt[1], dt[0]);
													sum[v.field.name]['min'] =  d;
													sum[v.field.name]['max'] = d;
												}
											}
										break;
										case 'tme':
											if (v.value) {
												if (sum[v.field.name]) {
													sum[v.field.name]['count'] += 1;
													dt = v.value.split(':');
													d = sum[v.field.name]['min'].split(':');
													if (parseInt(d[0]) > parseInt(dt[0])) sum[v.field.name]['min'] =  v.value;
													else if ((parseInt(d[0]) === parseInt(dt[0])) && (parseInt(d[1]) > parseInt(dt[1]))) sum[v.field.name]['min'] =  v.value;
													else {
														d = sum[v.field.name]['max'].split(':');
														if (parseInt(d[0]) < parseInt(dt[0])) sum[v.field.name]['max'] =  v.value;
														else if ((parseInt(d[0]) === parseInt(dt[0])) && (parseInt(d[1]) < parseInt(dt[1]))) sum[v.field.name]['max'] =  v.value;
													}
												} else {
													sum[v.field.name] = {type: 'tme'};
													sum[v.field.name]['count'] = 1;
													sum[v.field.name]['min'] =  v.value;
													sum[v.field.name]['max'] = v.value;
												}
											}
										break;
									}
								});
							});

              return res.json({count: datas.length, sum});
            });
					});

		} else {
			return res.json({count: 0, sum: {}});
		}
	});

	// devuelve los datos de los campos de tablas
	server.get('/api/getDatasTablesFields', function(req, res) {
		var token = '';
		if (typeof req.query.token !== 'undefined') {
			token = req.query.token.trim();
		}
		var refs = [];
		if (typeof req.query.refs !== 'undefined') {
			refs = JSON.parse(req.query.refs);
		}

		if ((token !== '') && (refs.length > 0)) {

			User
				.find({token: token}, function(error, users) {
					if (error) return res.status(400).send({code: 400, message: error.message});
					if (users.length === 0) return res.status(400).send({code: 400, message: 'Usuario no encontrado'});

					var tables = [];
					var fields = [];
					var result = [];
					refs.forEach(function(r){
						var spl = r.split(',');
						tables.push(spl[0]);
						fields.push(spl[1]);

						var found = result.some(r => ((r.table === spl[0]) && (r.field === spl[1])));
						if (!found){
							result.push({table: spl[0], field: spl[1], values:[]});
						}
					});

					DataTable
						.find({table: { $in: tables }})
						.select('table values.value values.field')
						.exec(function(err, datas){
						if (err) return res.status(400).send({code: 400, message: err.message});

						datas.forEach(function(dta){
							dta.values.forEach(function(vls){
								for(var i = 0; i < result.length; i++) {
									if ((result[i].table === dta.table.toString()) && (result[i].field === vls.field.toString())) {
										result[i].values.push({id: dta._id, value: vls.value});

										break;
									}
								}
							});
						});

						return res.json({datas: result});

					});
				});
		} else {
			return res.json({datas: []});
		}
	});

	// devuelve los datos de los campos de tablas publicas
	server.get('/api/getPublicTablesFields', function(req, res) {
		var refs = [];
		if (typeof req.query.refs !== 'undefined') {
			refs = JSON.parse(req.query.refs);
		}

		if (refs.length > 0) {

				var tables = [];
				var fields = [];
				var result = [];
				refs.forEach(function(r){
					var spl = r.split(',');
					tables.push(spl[0]);
					fields.push(spl[1]);
					var found = result.some(r => ((r.table === spl[0]) && (r.field === spl[1])));
					if (!found){
						result.push({table: spl[0], field: spl[1], values:[]});
					}
				});

				DataTable
					.find({table: { $in: tables }})
					.select('table values.value values.field')
					.exec(function(err, datas) {
					if (err) return res.status(400).send({code: 400, message: err.message});

					datas.forEach(function(dta){
						dta.values.forEach(function(vls){
							for(var i = 0; i < result.length; i++) {
								if ((result[i].table === dta.table.toString()) && (result[i].field === vls.field.toString())) {
									result[i].values.push({id: dta._id, value: vls.value});

									break;
								}
							}
						});
					});

					return res.json({datas: result});

				});

		} else {
			return res.json({datas: []});
		}
	});

  // adiciono un registro de datos a una tabla
	server.post('/api/addDatasTable/', function(req, res) {
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

					var table = '';
					if (typeof req.body.table !== 'undefined') {
						table = req.body.table.trim();
					}
					var values = [];
					if (typeof req.body.values !== 'undefined') {
						values = req.body.values;
					}

					if (table !== '') {
							// verifico que la tabla exista
							Table.findById(table, function(errr, tbl){
								if (errr) return res.status(400).send({code: 400, message: errr.message});
								if (tbl === null) return res.status(400).send({code: 400, message: 'Tabla no existe'});

								var dttbl = new DataTable({owner, table, values});
								dttbl.save(function(err, datatable){
									if (err) return res.status(400).send({code: 400, message: err.message});

									var detail = 'datatable:' + table + ',' + JSON.stringify(values);
									var log = new Log({user: owner, operation: 1, detail: detail});
									log.save(function(er, lg){
										if (er) return res.status(400).send({code: 400, message: er.message});

										return res.json({ datatable });
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

	// adiciono un registro de datos a una tabla
	server.post('/api/addBulkDatasTable/', function(req, res) {
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

					var table = '';
					if (typeof req.body.table !== 'undefined') {
						table = req.body.table.trim();
					}
					var values = [];
					if (typeof req.body.values !== 'undefined') {
						values = req.body.values;
					}

					if ((table !== '') && (values.length > 0)) {
							// verifico que la tabla exista
							Table.findById(table, function(errr, tbl){
								if (errr) return res.status(400).send({code: 400, message: errr.message});
								if (tbl === null) return res.status(400).send({code: 400, message: 'Tabla no existe'});

								var toSave = values.map(function(v) {
									return {owner: owner, table: table, values: v}
								});

								DataTable.insertMany(toSave, function(err, docs) {
									if (err) return res.status(400).send({code: 400, message: err.message});

									return res.json({ ok: true });
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

	server.post('/api/updDatasTable/', function(req, res) {
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
					var values = [];
					if (typeof req.body.values !== 'undefined') {
						values = req.body.values;
					}

					if ((id !== '') &&
							(values.length > 0)
						){
								DataTable.findOneAndUpdate({_id: id}, {$set: {values}}, function(err, numReplaced){
									if (err) return res.status(400).send({code: 400, message: err.message});

									var detail = 'datatable:' + id + ',' + JSON.stringify(values);
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


	server.delete('/api/delDatasTable/:token/:id', function(req, res) {
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
						DataTable.findOne({'values.value': id})
						.populate('table values.field')
						.exec(function(errr, elem){
							if (errr) return res.status(400).send({code: 400, message: errr.message});

							if (elem !== null) {
								let info = '. ';
								elem.values.forEach(function(val) {
									if (val.field.kind === 'txt') {
										info += val.field.name + ': ' + val.value + '. ';
									}
								});

								return res.status(400).send({code: 400, message: 'Registro en tabla: ' + elem.table.name + info});
							} else {
								DataTable.findById(id)
								.populate({
									path: 'values.field',
								})
								.exec(function(er, data){
									if (er) return res.status(400).send({code: 400, message: er.message});

									data.values.forEach(function(v){
										if (v.field.kind === 'img'){
											if (v.value !== '') {
												var path = config.upload.images + v.value;
												if (fs.existsSync(path)){
													fs.unlinkSync(path);
													path = config.upload.images + '/thumbnails/' + v.value;
													if (fs.existsSync(path)){
														fs.unlinkSync(path);
													}
												}
											} else {
												var path = config.upload.images + data._id + '-' + v.field._id + '.png';
												if (fs.existsSync(path)){
													fs.unlinkSync(path);
													path = config.upload.images + '/thumbnails/' + data._id + '-' + v.field._id;
													if (fs.existsSync(path + '.png')){
														fs.unlinkSync(path + '.png');
													}
												}
											}
										} else if (v.field.kind === 'fle'){
											if (v.value !== '') {
												var path = config.upload.files + v.value;
												if (fs.existsSync(path)){
													fs.unlinkSync(path);
												}
											} else {
												var path = config.upload.files + data._id + '-' + v.field._id;
												if (fs.existsSync(path + '.rar')){
													fs.unlinkSync(path + '.rar');
												} else if (fs.existsSync(path + '.zip')){
													fs.unlinkSync(path + '.zip');
												}
											}
										}
									});

									DataTable.findByIdAndRemove(id, function(err) {
										if (err) return res.status(400).send({code: 400, message: err.message});

										var detail = 'datatable:' + id.toString();
										var log = new Log({user: owner, operation: 3, detail: detail});
										log.save(function(er, lg){
											if (er) return res.status(400).send({code: 400, message: er.message});

											return res.json({ 'ok': true });
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


	server.post('/api/addDyImage', function(req, res) {
		var multiparty = require('multiparty');
		var thumb = require('node-thumbnail').thumb;

		var form = new multiparty.Form();

		form.parse(req, function(err, fields, files){
			if (err) console.log(err);

			var path = files.imageFile[0].path;
			var originalFilename = files.imageFile[0].originalFilename;

			var fileExt = originalFilename.split('.').pop();
			var copyToPath = config.upload.images + fields.id[0] + '-' + fields.field[0] + '.' + fileExt;

			fs.readFile(path, function(err, data) {
				// make copy of image to new location
				fs.writeFile(copyToPath, data, function(err) {
					if (err) return res.send({ok: false, message: 'Error copiando archivo'});
					// delete temp image
					fs.unlink(path, function() {
						// create thumb
						var dest = config.upload.images + 'thumbnails/';
						thumb({
							suffix: '',
							source: copyToPath,
							destination: dest,
							width: 150,
							overwrite: true
						}).then(function() {
							return res.send({ok: true, copyToPath});
							//console.log('Success thumb');
						}).catch(function(e) {
							console.log('Error thumb: ', e.toString());
						});
					});
				});
			});
		});
	});

	server.post('/api/addDyFile', function(req, res) {
		var multiparty = require('multiparty');
		var form = new multiparty.Form();

		form.parse(req, function(err, fields, files){
			if (err) console.log(err)

			var path = files.compressedFile[0].path;
			var originalFilename = files.compressedFile[0].originalFilename;
			var fileExt = originalFilename.split('.').pop();
			var copyToPath = config.upload.files + fields.id[0] + '-' + fields.field[0] + '.' + fileExt;

			fs.readFile(path, function(err, data) {
				// make copy of image to new location
				fs.writeFile(copyToPath, data, function(err) {
					if (err) return res.send({ok: false, message: 'Error copiando archivo'});
					// delete temp image
					fs.unlink(path, function() {
						return res.send({ok: true, copyToPath});
					});
				});
			});
		});
	});

}

module.exports = datatablesController;
