var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var fieldstageSchema = new Schema({
  stage: { type: Schema.Types.ObjectId, ref: 'Stage' },
	name: { type: String, required: [true, '{PATH} requerido'] },
	kind: { type: String, default: 'txt' },
	value: { type: String, default: '' },
	desc: { type: String, required: [true, '{PATH} requerido'] },
	obligatory: { type: Boolean, default: false },
}, {collection:"fieldstage"});

// create a model
var FieldStage = mongoose.model('FieldStage', fieldstageSchema);

module.exports = FieldStage;
