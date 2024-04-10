/* 
* provider Schema
* Author : Konstantins Kolcovs
* (c) 2016, OK Media Group LTD.
* File : provider.js
*/ 


var mongoose = require('mongoose');
//var db = mongoose.createConnection('mongodb://' + process.env.DBHOST + '/' + process.env.DBNAME);
var db = mongoose.connect(process.env.DBURI, { keepAlive: 30000,
    connectTimeoutMS: 30000,
      useMongoClient : true,
    socketTimeoutMS: 30000,
    promiseLibrary: global.Promise});
var Schema = mongoose.Schema;
//Schema

var accountrouteSchema = new Schema({
   apicode : {type : String, index : true, required : true},
   tag : {type : String, index : true},
   urlpath : String,
   currency : String,
   link : {type : String, required : true},
   backup_link : String,
   account : Schema.Types.ObjectId,
   isSystemWide : Boolean,
   username : {type : String},
   password : String,
   api_name : String,
   extnwcode : String,
   extcode : String,
   reqgwcode : String,
   reqgwtype : String,
   svcport : String,
   svctype : String,
   sourceID : String,
   processTypeID : String,
   channelID : String,
   pin : String,
    connectionMode : {type : String, enum : ['direct', 'mfin', 'awake']},
    tibco_certificate : String,
    tibco_key : String,
   sourceNumbers : [],
   active : Boolean
    
}, {minimize : false, timestamps : true});
mongoose.Promise = global.Promise;
//Return model
module.exports = db.model('accountroute', accountrouteSchema);
