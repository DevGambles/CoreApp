/* 
* Product Schema
* Author : Konstantins Kolcovs
* (c) 2016, OK Media Group LTD.
* File : product.js
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

var productSchema = new Schema({
    sku : {type : String, required : true, index : true},
    account : {type : Schema.Types.ObjectId, required : true, index : true},
    name : {type : String, index : true},
    active : Boolean,
    operator_id : String,
    country : String,
    min_denomination : String,
    max_denomination : String,
    topup_currency : String,
  step : String,
  fx_rate : String,
  currency : String,
  price : String
    
}, {minimize : false, timestamps : true});
mongoose.Promise = global.Promise;
//Return model
module.exports = db.model('product', productSchema);
