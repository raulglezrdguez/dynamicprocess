const mongoose = require('mongoose')
  , TProcess = require('../models/tprocess')
  , config = require("../config");
  
const mongooseHost = config.mongoose.host;
const mongoosePort = config.mongoose.port;
const mongooseDb = config.mongoose.db;

mongoose.connect(`mongodb://${mongooseHost}:${mongoosePort}/${mongooseDb}`, { useNewUrlParser: true });

const db = mongoose.connection;
db.on('error', () => {console.log( '---NO CONECTADO a mongoose')});
db.once('open', () => {
	console.log( '+++CONECTADO a mongoose');
	
	for (let i = 0; i < config.tprocess.length; i++) {
		const tp = new TProcess({
			name: config.tprocess[i].name, 
			active: true
		});
		
		tp.save().then(function(tproc){
			console.log('Tipo de proceso ' + tproc.name + ' almacenado');
			
			if (i === config.tprocess.length - 1) {
				console.log('proceso terminado');
				
				process.exit();
			}
		});
	}
});
