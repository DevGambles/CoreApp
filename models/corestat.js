/* 
* corestat Schema
* Author : Konstantins Kolcovs
* (c) 2016, OK Media Group LTD.
* File : corestat.js
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

var corestatSchema = new Schema({
   time : {type : Date, index : true},
   balances : [],
   top5_countries_topup_count : [],
   top5_countries_topup_amount : [],
   top5_accounts_topup_amount : [],
   top5_accounts_topup_count : [],
   top5_operations_bycode : [],
   total_operations_count : Number
    
}, {minimize : false, timestamps : true});
mongoose.Promise = Promise;
//Return model
module.exports = db.model('corestat', corestatSchema);
