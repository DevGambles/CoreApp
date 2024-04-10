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

var ruleSchema = new Schema({
    tag : String,
    priority : Number,
    active : Boolean
})
var linkruleSchema = new Schema({
   apicode : {type : String, index : true, required : true},
   rule_name : String,
   account : Schema.Types.ObjectId,
   isSystemWide : Boolean,
   rules : [ruleSchema],
   active : Boolean
    
}, {minimize : false, timestamps : true});
mongoose.Promise = global.Promise;
//Return model
module.exports = db.model('linkrule', linkruleSchema);
