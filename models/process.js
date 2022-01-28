var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var processSchema = new Schema({
	owner: { type: String, required: [true, '{PATH} requerido'] },
	name: { type: String, required: [true, '{PATH} requerido'] },
	desc: { type: String, required: [true, '{PATH} requerido'] },
	tprocess: { type: Schema.Types.ObjectId, ref: 'TProcess', required: true },
	active: { type: Boolean, default: false },
	friend: [{ type: Schema.Types.ObjectId, ref: 'Rol', default: [] }],
	data: [{ type: Schema.Types.ObjectId, ref: 'Rol' , default: [] }],
	firststage: { type: Schema.Types.ObjectId, ref: 'Stage', required: false },
	stage: [{ type: Schema.Types.ObjectId, ref: 'Stage', default: [] }],
	date: { type: Number, default: Date.now() }, // fecha de creacion
}, {collection:"process"});

// create a model
var Process = mongoose.model('Process', processSchema);

module.exports = Process;
