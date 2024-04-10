/* 
* elprod Schema
* Author : Konstantins Kolcovs
* (c) 2016, OK Media Group LTD.
* File : elprod.js
*/ 


var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');
var db = mongoose.connect(process.env.DBURI, { keepAlive: 30000,
  connectTimeoutMS: 30000,
    useMongoClient : true,
  socketTimeoutMS: 30000,
  promiseLibrary: global.Promise});
//var db = mongoose.createConnection('mongodb://' + process.env.DBHOST + '/' + process.env.DBNAME);
var Schema = mongoose.Schema;
//Schema

var elprodSchema = new Schema({
	ngcr_code : {type : String, index : true},
    ngtp_code : {type : String, index : true},
    ngpb_code : {type : String, index : true},
    bank_name : {type : String, index : true},
    active : Boolean
    
}, {minimize : false, timestamps : true});
mongoose.Promise = global.Promise;
//Return model
elprodSchema.plugin(mongoosePaginate);
module.exports = db.model('bank', elprodSchema);
