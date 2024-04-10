/* 
* setting Schema
* Author : Konstantins Kolcovs
* (c) 2017, OK Media Group LTD.
* File : setting.js
*/ 


var mongoose = require('mongoose');
var db = mongoose.connect(process.env.DBURI, { keepAlive: 30000,
    connectTimeoutMS: 30000,
      useMongoClient : true,
    socketTimeoutMS: 30000,
    promiseLibrary: global.Promise});
//var db = mongoose.createConnection('mongodb://' + process.env.DBHOST + '/' + process.env.DBNAME);
var Schema = mongoose.Schema;
//Schema

var settingSchema = new Schema({
 key : {type : String, index : true},
 value : {type : String, index : true},
 active : Boolean
    
}, {minimize : false, timestamps : true});

var mainSchema = new Schema({
    account : Schema.Types.ObjectId,
    active : Boolean,
    settings : [settingSchema]
}, {minimize : false, timestamps : true});
mongoose.Promise = global.Promise;
//Return model
module.exports = db.model('asetting', mainSchema);
