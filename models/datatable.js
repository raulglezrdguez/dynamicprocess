var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var datatableSchema = new Schema({
  table: { type: Schema.Types.ObjectId, ref: 'Table', required: [true, '{PATH} requerido'] },
	owner: { type: String, required: [true, '{PATH} requerido'] },
  values: [{
    field: { type: Schema.Types.ObjectId, ref: 'Field', required: [true, '{PATH} requerido'] },
    value: { type: String, default: '' }
  }],
  date: { type: Number, default: Date.now() }, // fecha de creacion
}, {collection:"datatable"});

// create a model
var DataTable = mongoose.model('DataTable', datatableSchema);

module.exports = DataTable;
