const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const adminSchema = new Schema({
    created: { type: Date, default:Date.now },
	first_name:{type:String, default:""},
	last_name:{type:String, default:""},
	email:{type:String, default:""},
	password:{type:String, default:""},
});

module.exports = mongoose.model('admins', adminSchema);
