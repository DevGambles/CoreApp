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
  account : Schema.Types.ObjectId,
  promo_name : String,
  description : String,
  active : Boolean,
  date_start : Date,
  date_end : Date,
  reward_mode : {type : String, enum : ['pct', 'fix']},
  trigger_mode : {type : String, enum : ['single', 'multiple']},
  threshold : Number,
  reward_amt : Number,
  scope : {type : String, enum : ['all', 'operator', 'list']},
  operator : String,
  list : [],
  send_sms : Boolean,
  sms_text : String,
  reward_count : Number,
  reward_payout : Number,
  currency : String,
  topup_total_amount : Number,


}, {minimize : false, timestamps : true});
mongoose.Promise = global.Promise;
/*
monthlystatSchema.plugin(mongooseToCsv, {
  headers : 'issued batch valid valid_from valid_to serial code value currency'
})
*/
//Return model
module.exports = db.model('promo', msisdncacheSchema);
