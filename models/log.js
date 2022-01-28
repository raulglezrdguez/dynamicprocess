var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var logSchema = new Schema({
	user: { type: Schema.Types.ObjectId, ref: 'User', required: [true, '{PATH} requerido'] },
	operation: { type: Number, required: [true, '{PATH} requerido']}, //1: create, 2: update, 3: delete
	detail: { type: String, required: [true, '{PATH} requerido']}, // descripcion de la operacion
	date: { type: Number, default: Date.now()}, // fecha del log
}, {collection:"log"});

// create a model
var Log = mongoose.model('Log', logSchema);

module.exports = Log;

