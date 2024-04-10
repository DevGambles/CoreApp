/* 
* txn Schema
* Author : Konstantins Kolcovs
* (c) 2016, OK Media Group LTD.
* File : txn.js
*/ 


var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');
var db = mongoose.connect(process.env.DBURI, { 
  keepAlive: process.env.KEEP_ALIVE,
  connectTimeoutMS: process.env.CONNECT_TIMEOUT_MS,
  socketTimeoutMS: process.env.SOCKET_TIMEOUT_MS,
  useMongoClient : true,  
  promiseLibrary: global.Promise});
//var db = mongoose.createConnection('mongodb://' + process.env.DBHOST + '/' + process.env.DBNAME);
var Schema = mongoose.Schema;
//Schema

var ukblpriceSchema = new Schema({
  operator_id : String,
 country : String,
 operator_name : String,
  currency : String,
  denomination : String,
  unit_cost : Number,
  slug : String,
  card_id : Number,
 active : {type : Boolean, index : true},
 action : String
    
}, {minimize : false, timestamps : true});
mongoose.Promise = global.Promise;
ukblpriceSchema.plugin(mongoosePaginate);
//Return model
module.exports = db.model('ukblprice', ukblpriceSchema);
