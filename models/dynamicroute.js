/* 
* provider Schema
* Author : Konstantins Kolcovs
* (c) 2016, OK Media Group LTD.
* File : provider.js
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

var dynamicrouteSchema = new Schema({
   apicode : {type : String, index : true, required : true},
   tag : {type : String, index : true},
   protocol : {type : String, enum : ['http', 'https']},
   hostType : {type : String, enum : ['tibco', 'evc', 'other']},
   host : String,
   port : String,
   active : Boolean
    
}, {minimize : false, timestamps : true});
mongoose.Promise = global.Promise;
//Return model
module.exports = db.model('dynamicroute', dynamicrouteSchema);
