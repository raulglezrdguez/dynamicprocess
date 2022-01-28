var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var userSchema = new Schema({
	owner: { type: Schema.Types.ObjectId, ref: 'User', required: false },
	name: { type: String, required: [true, '{PATH} requerido']},
	email: { type: String, required: [true, '{PATH} requerido']},
	password: { type: String, required: [true, '{PATH} requerido']},
	rol: [{ type: Schema.Types.ObjectId, ref: 'Rol' , required: false }],
	active: { type: Boolean, default: false },
	token: { type: String, default: '' },
	date: { type: Number, default: Date.now()}, // fecha de creacion
}, {collection:"user"});

// create a model
var User = mongoose.model('User', userSchema);

module.exports = User;
