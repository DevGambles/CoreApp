/* 
* txn Schema
* Author : Konstantins Kolcovs
* (c) 2016, OK Media Group LTD.
* File : txn.js
*/ 


var mongoose = require('mongoose');
var mongooseToCsv = require('mongoose-to-csv');
var db = mongoose.connect(process.env.DBURI, { 
  keepAlive: process.env.KEEP_ALIVE,
  connectTimeoutMS: process.env.CONNECT_TIMEOUT_MS,
  socketTimeoutMS: process.env.SOCKET_TIMEOUT_MS,
  useMongoClient : true,
  promiseLibrary: global.Promise});
//var db = mongoose.createConnection('mongodb://' + process.env.DBHOST + '/' + process.env.DBNAME);
var Schema = mongoose.Schema;
//Schema
var epinproductSchema = new Schema({
  owner : Schema.Types.ObjectId,
  count : Number,
  denomination : String,
  iso : String,
  operator_id : String,
  sku : {type : String, index : true}
    
}, {minimize : false, timestamps : true});
mongoose.Promise = global.Promise;
/*
epinproductSchema.plugin(mongooseToCsv, {
  headers : 'issued batch valid valid_from valid_to serial code value currency'
})
*/
//Return model
module.exports = db.model('epinproduct', epinproductSchema);
