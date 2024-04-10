/* 
* txn Schema
* Author : Konstantins Kolcovs
* (c) 2016, OK Media Group LTD.
* File : txn.js
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

var msisdncacheSchema = new Schema({
  msisdn : {type : String, index : true},
  operatorId : String,
    promo_id : Schema.Types.ObjectId,
  account : Schema.Types.ObjectId,
  tcount : Number,
  tamt : Number,
  last_topup : Date,
    bonus_amount : Number,
    bonus_count : Number,
}, {minimize : false, timestamps : true});
mongoose.Promise = global.Promise;
/*
monthlystatSchema.plugin(mongooseToCsv, {
  headers : 'issued batch valid valid_from valid_to serial code value currency'
})
*/
//Return model
module.exports = db.model('numcounter', msisdncacheSchema);
