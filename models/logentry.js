/* 
* apicred Schema
* Author : Konstantins Kolcovs
* (c) 2016, OK Media Group LTD.
* File : apicred.js
*/ 


var mongoose = require('mongoose');
var db = mongoose.createConnection(process.env.LOGURI);
/*
var db = mongoose.connect(process.env.LOGURI, { keepAlive: 30000,
    connectTimeoutMS: 30000,
      useMongoClient : true,
    socketTimeoutMS: 30000,
    promiseLibrary: global.Promise});
    */
var Schema = mongoose.Schema;
//Schema

var apicredSchema = new Schema({
  date : Date,
  host : String,
  txkey : String,
  level : {type : String, enum : ['error', 'warn', 'info', 'debug']},
    msg : String
    
}, {minimize : false, timestamps : true});
mongoose.Promise = global.Promise;
//Return model
module.exports = db.model('logentry', apicredSchema);
