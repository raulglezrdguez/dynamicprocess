var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var tprocessSchema = new Schema({
	name: { type: String, required: [true, '{PATH} requerido'] },
	active: { type: Boolean, default: true },
		
}, {collection:"tprocess"});

// create a model
var TProcess = mongoose.model('TProcess', tprocessSchema);

module.exports = TProcess;
