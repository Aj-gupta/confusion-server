const mongoose = require('mongoose');
const Schema = mongoose.Schema;
require('mongoose-currency').loadType(mongoose);
const Currency = mongoose.Types.Currency;

const leaderSchema = new Schema({
	name:{
		type:'string',
		required:true
	},
	image:{
		type:'string',
		required:true
	},
	designation:{
		type:'string',
		required:true
	},
	abbr:{
		type:'string',
		required:true
	},
	featured:{
		type:Boolean,
        default:false
	},
	description:{
		type:'string',
		required:true
	}
	
},{ timestamps:true});

var Leaders = mongoose.model('Leader', leaderSchema);

module.exports = Leaders;