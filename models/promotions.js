const mongoose = require('mongoose');
const Schema = mongoose.Schema;
require('mongoose-currency').loadType(mongoose);
const Currency = mongoose.Types.Currency;

const promoSchema = new Schema({
	name:{
		type:'string',
		required:true
	},
	image:{
		type:'string',
		required:true
	},
	label:{
		type:'string',
		required:true
	},
	price:{
		type:Currency,
        required:true,
        min:0
	},
	featured:{
		type:Boolean,
        default:false
	},
	description:{
		type:'string',
		required:true
	},
},{ timestamps:true});

var Promotions = mongoose.model('Promotion', promoSchema);

module.exports = Promotions;