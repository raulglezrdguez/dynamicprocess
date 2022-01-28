var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var fieldSchema = new Schema({
  table: { type: Schema.Types.ObjectId, ref: 'Table' },
	name: { type: String, required: [true, '{PATH} requerido'] },
	kind: { type: String, default: 'txt' },
	value: { type: String, default: '' },
	desc: { type: String, required: [true, '{PATH} requerido'] },
	obligatory: { type: Boolean, default: false },
}, {collection:"field"});

// create a model
var Field = mongoose.model('Field', fieldSchema);

module.exports = Field;
