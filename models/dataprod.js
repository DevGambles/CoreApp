/* 
* dataprod Schema
* Author : Konstantins Kolcovs
* (c) 2016, OK Media Group LTD.
* File : dataprod.js
*/ 


var mongoose = require('mongoose');
var db = mongoose.connect(process.env.DBURI, { 
  keepAlive: process.env.KEEP_ALIVE,
  connectTimeoutMS: process.env.CONNECT_TIMEOUT_MS,
  socketTimeoutMS: process.env.SOCKET_TIMEOUT_MS,
  useMongoClient : true,
  promiseLibrary: global.Promise});
//var db = mongoose.createConnection('mongodb://' + process.env.DBHOST + '/' + process.env.DBNAME);
var Schema = mongoose.Schema;
//Schema

var dataprodSchema = new Schema({
	apid : {type : String, index : true},
    iso : {type : String, index : true},
    acloperid : {type : String, index : true},
    sku : {type : String, required : true, index : true},
    psku : {type : String, index : true},
    use_psku : Boolean,
    name : {type : String, index : true},
    active : Boolean,
    operator_id : String,
    country : String,
    data_amount : String,
    topup_price : Number,
    topup_currency : String,
  step : Number,
  fx_rate : String,
  currency : String,
  price : String,
  validity : String
    
}, {minimize : false, timestamps : true});
mongoose.Promise = global.Promise;
//Return model
module.exports = db.model('dataprod', dataprodSchema);
