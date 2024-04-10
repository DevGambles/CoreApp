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

var providerSchema = new Schema({
   provider_name : {type : String, index : true, required : true},
   provider_code : {type : String, index : true},
   balance : Number,
   currency : String,
   active : Boolean,
   priority : Number,
   global : Boolean
    
}, {minimize : false, timestamps : true});
mongoose.Promise = global.Promise;
//Return model
module.exports = db.model('provider', providerSchema);
