/* 
* provmapping Schema
* Author : Konstantins Kolcovs
* (c) 2017, OK Media Group LTD.
* File : provmapping.js
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

var provmappingSchema = new Schema({
 country : {type : String, index : true},
 iso : {type : String, index : true},
 operator_name : {type : String, index : true},
 trt_id : {type : String, index : true},
 trl_id : {type : String, index : true}
    
}, {minimize : false, timestamps : true});
mongoose.Promise = global.Promise;
//Return model
module.exports = db.model('provmapping', provmappingSchema);
