/* 
* provider Schema
* Author : Konstantins Kolcovs
* (c) 2016, OK Media Group LTD.
* File : provider.js
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

var apibalanceSchema = new Schema({
   code : {type : String, index : true, required : true},
   subcode : {type : String, index : true},
   credential : Schema.Types.ObjectId,
   balance : Number,
   currency : String,
   tag : String,
   lastCheck : Date,
   time : Date
    
}, {minimize : false, timestamps : true});
mongoose.Promise = global.Promise;
//Return model
module.exports = db.model('apibalhistory', apibalanceSchema);
