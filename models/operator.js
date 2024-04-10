/* 
* operator Schema
* Author : Konstantins Kolcovs
* (c) 2016, OK Media Group LTD.
* File : operator.js
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

var operatorSchema = new Schema({
   operator_name : {type : String, index : true, required : true},
   country : {type : String, index : true},
   iso : {type : String, index : true},
   currency : {type : String, index : true},
   mcc : String,
   mnc : String,
   country_code : String,
   hasLocalOper : Boolean,
   hasOpenRange : Boolean,
   localOperatorLookup : Boolean,
   perfProv : String,
   prefixLength : String,
      min_length : String,
   max_length : String
    
}, {minimize : false, timestamps : true});
mongoose.Promise = global.Promise;
//Return model
module.exports = db.model('operator', operatorSchema);
