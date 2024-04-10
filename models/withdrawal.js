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

var withdrawalSchema = new Schema({
  time : {type : Date, default : Date.now, required : true, index : true},
  account : {type : Schema.Types.ObjectId, required : true, index : true},
  state : {type : String, enum : ['created', 'processing', 'satisfied', 'declined']},
  amount : String,
  currency : String,
  description : String,
  note : String
    
}, {minimize : false, timestamps : true});
mongoose.Promise = global.Promise;
withdrawalSchema.plugin(mongoosePaginate);
//Return model
module.exports = db.model('withdrawal', withdrawalSchema);
