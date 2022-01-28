const mongoose = require('mongoose')
  , User = require('../models/user')
  , Module = require('../models/module')
  , Rol = require('../models/rol')
  , config = require("../config")
  , md5 = require('../node_modules/md5');
  
const mongooseHost = config.mongoose.host;
const mongoosePort = config.mongoose.port;
const mongooseDb = config.mongoose.db;

mongoose.connect(`mongodb://${mongooseHost}:${mongoosePort}/${mongooseDb}`, { useNewUrlParser: true });

const db = mongoose.connection;
db.on('error', () => {console.log( '---NO CONECTADO a mongoose')});
db.once('open', () => {
	console.log( '+++CONECTADO a mongoose');

	User.deleteMany({}, function(error){
		if (error) {
			console.log(error);
		} else {
			Module.deleteMany({}, function(errorr){
				if (errorr) {
					console.log(errorr);
				} else {
					Rol.deleteMany({}, function(errorrr){
						if (errorrr) {
							console.log(errorrr);
						} else {
							const usr = new User({
								name: config.admin.name, 
								email: config.admin.email,
								password: md5(config.admin.password),
								active: true});
								
							usr.save(function(err, usuario){
								if (err) console.log(err);
								else {
									console.log(usuario.name + ' almacenado');
									
									const mdl = new Module({
										owner: usuario._id,
										name: 'Administración', 
										desc: 'Modulo de administración del sistema', 
										active: true});
									mdl.save(function(errr, modulo){
										if (errr) console.log(errr);
										else {
											console.log('Modulo ' + modulo.name + ' almacenado');

											const rl = new Rol({
												owner: usuario._id,
												name: 'Administrador', 
												desc: 'Administrador del sistema',
												module: modulo._id,
												active: true				
											});
											
											rl.save().then(function(role){
												console.log('Rol ' + role.name + ' almacenado');
												
												//usuario.updateOne({rol: [{module: modulo._id, rol: [role._id]}]}, function(errrr, newuser){
												usuario.updateOne({rol: [role._id]}, function(errrr, newuser){
													if (errrr) console.log(errrr);
													else console.log('proceso terminado');
													
													process.exit();
												});
												
											});
										}
									});
								}
							});

						}

					});
				}
			});
		}
	});
	
	

});
