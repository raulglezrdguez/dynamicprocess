var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var moduleSchema = new Schema({
	owner: { type: Schema.Types.ObjectId, ref: 'User', required: [true, '{PATH} requerido'] },
	name: { type: String, required: [true, '{PATH} requerido'] },
	desc: { type: String, required: [true, '{PATH} requerido'] },
	active: { type: Boolean, default: false },
	date: { type: Number, default: Date.now()}, // fecha de creacion
	friend: [{ type: Schema.Types.ObjectId, ref: 'Rol' , required: false }],
		
}, {collection:"module"});

// create a model
var Module = mongoose.model('Module', moduleSchema);

module.exports = Module;

/*
friend: [{ type: Schema.Types.ObjectId, ref: 'Rol' , required: false }]
			{
				module: { type: Schema.Types.ObjectId, ref: 'Module' , required: false }, 
				rol: [
					{ type: Schema.Types.ObjectId, ref: 'Rol' , required: false }
				]
			}
		],
*/
