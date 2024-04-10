/* 
* currency Schema
* Author : Konstantins Kolcovs
* (c) 2016, OK Media Group LTD.
* File : currency.js
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

var currencySchema = new Schema({
   type : {type : String, enum : ['srate', 'rtimes', 'ltx']},
   timedef : {type : String, enum : ['5m', '15m', '1h', '3h', '12h', '24h', '1w', '1m']},
   values : []
    
}, {minimize : false, timestamps : true});
mongoose.Promise = global.Promise;
//Return model
module.exports = db.model('rtstat', currencySchema);
