var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var tableSchema = new Schema({
	owner: { type: String, required: [true, '{PATH} requerido'] },
	name: { type: String, required: [true, '{PATH} requerido'] },
	desc: { type: String, required: [true, '{PATH} requerido'] },
	module: { type: Schema.Types.ObjectId, ref: 'Module' },
	active: { type: Boolean, default: false },
	friend: [{ type: Schema.Types.ObjectId, ref: 'Rol' , default: [] }],
	data: [{ type: Schema.Types.ObjectId, ref: 'Rol' , default: [] }],
	free: { type: Boolean, default: false },
	field: [{ type: Schema.Types.ObjectId, ref: 'Field' , default: [] }],
	date: { type: Number, default: Date.now() }, // fecha de creacion
}, {collection:"table"});

// create a model
var Table = mongoose.model('Table', tableSchema);

module.exports = Table;
