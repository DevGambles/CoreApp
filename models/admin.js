/* 
* admin Schema
* Author : Konstantins Kolcovs
* (c) 2016, OK Media Group LTD.
* File : admin.js
*/ 


var mongoose = require('mongoose');
//var db = mongoose.createConnection('mongodb://' + process.env.DBHOST + '/' + process.env.DBNAME);
var db = mongoose.connect(process.env.DBURI, { 
  keepAlive: process.env.KEEP_ALIVE,
  connectTimeoutMS: process.env.CONNECT_TIMEOUT_MS,
  socketTimeoutMS: process.env.SOCKET_TIMEOUT_MS,
  useMongoClient : true,
  promiseLibrary: global.Promise});
var Schema = mongoose.Schema;
//Schema

var adminSchema = new Schema({
   username : {type : String, index : true, required : true},
   password : {type : String, required : true},
   first_name : String,
   last_name : String,
   occupation : String,
   main_account : Schema.Types.ObjectId,
   email : String,
   active : Boolean,
   last_login : {type : Date, default : Date.now},
   last_ip : String,
   skype : String,
   avatar : String,
   access_level : {type : String, enum : ['master', 'financial', 'technical', 'partner']},
   partner_tag : String,
   send_notifications : Boolean
    
}, {minimize : false, timestamps : true});
mongoose.Promise = Promise;
//Return model
module.exports = db.model('admin', adminSchema);
