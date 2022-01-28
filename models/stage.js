var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var stageSchema = new Schema({
	process: { type: Schema.Types.ObjectId, ref: 'Process', required: [true, '{PATH} requerido'] },
	name: { type: String, required: [true, '{PATH} requerido'] },
  desc: { type: String, required: [true, '{PATH} requerido'] },
	rol: [{ type: Schema.Types.ObjectId, ref: 'Rol', required: false }],
	rolstage: [{ type: Schema.Types.ObjectId, ref: 'Stage', required: false }],
	field: [{ type: Schema.Types.ObjectId, ref: 'FieldStage', default: [] }],
	next: [{ type: Schema.Types.ObjectId, ref: 'Stage', required: [true, '{PATH} requerido'] }],
	active: { type: Boolean, default: false },
}, {collection:"stage"});

// create a model
var Stage = mongoose.model('Stage', stageSchema);

module.exports = Stage;
