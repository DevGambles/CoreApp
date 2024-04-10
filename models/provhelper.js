/* 
* provhelper Schema
* Author : Konstantins Kolcovs
* (c) 2017, OK Media Group LTD.
* File : provhelper.js
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

var provhelperSchema = new Schema({
  iso : {type : String, index : true},
  country : String,
  operator_name : String,
  operator_id : {type : String, index : true},
  code : String

    
}, {minimize : false, timestamps : true});
mongoose.Promise = global.Promise;
//Return model
module.exports = db.model('provhelper', provhelperSchema);
