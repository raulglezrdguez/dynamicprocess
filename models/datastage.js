var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var datastageSchema = new Schema({
  register: { type: Schema.Types.ObjectId, required: [true, '{PATH} requerido'] },
  stage: { type: Schema.Types.ObjectId, ref: 'Stage', required: [true, '{PATH} requerido'] },
	owner: { type: String, required: [true, '{PATH} requerido'] },
  next: { type: Schema.Types.ObjectId, ref: 'Stage', required: false },
  values: [{
    field: { type: Schema.Types.ObjectId, ref: 'FieldStage', required: [true, '{PATH} requerido'] },
    value: { type: String, default: '' }
  }],
  date: { type: Number, default: Date.now() }, // fecha de creacion
}, {collection:"datastage"});

// create a model
var DataStage = mongoose.model('DataStage', datastageSchema);

module.exports = DataStage;
