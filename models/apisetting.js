/* 
* apicred Schema
* Author : Konstantins Kolcovs
* (c) 2016, OK Media Group LTD.
* File : apicred.js
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


var apisettingSchema = new Schema({
   apicode : {type : String, index : true},
   name : {type : String, required : true},
   status : {type : String, required : true, default : "1"},
   category : {type : String, required : true, enum : ['airtime','data','tv','electricity','fundtransfer','lottery','fees','others']},
   provider : String
}, {minimize : false, timestamps : true});
mongoose.Promise = global.Promise;
//Return model
module.exports = db.model('apisetting', apisettingSchema);
