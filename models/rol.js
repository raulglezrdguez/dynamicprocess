var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var rolSchema = new Schema({
	owner: { type: Schema.Types.ObjectId, ref: 'User', required: [true, '{PATH} requerido'] },
	name: { type: String, required: [true, '{PATH} requerido'] },
	desc: { type: String, required: [true, '{PATH} requerido'] },
	module: { type: Schema.Types.ObjectId, ref: 'Module', required: [true, '{PATH} requerido'] },
	active: { type: Boolean, default: false },
	date: { type: Number, default: Date.now()}, // fecha de creacion
}, {collection:"rol"});

// create a model
var Rol = mongoose.model('Rol', rolSchema);

module.exports = Rol;
