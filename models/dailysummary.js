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

var accountTopupSchema = new Schema({
    account : Schema.Types.ObjectId,
    amount : Number,
    balance_before : Number,
    balance_after : Number,
    currency : String,
    time : Date,
    type : String,
    topup_by : String
}, {minimize : false, timestamps : true})
var salesRecSchema = new Schema({
    account : Schema.Types.ObjectId,
    account_name : String,
    sumSA : Number,
    sumTA : Number,
    cnt : Number,
    report_id : Schema.Types.ObjectId

}, {minimize : false, timestamps : true});
var dailystatSchema = new Schema({
  time : Date,
  stockLevels : [],
  stuckTransactions : [],
  mismatchTable : [],
  stockTotal : Number,
  prepaidBalTotal : Number,
  salesTotal : Number,
  topupsTotal : Number,
  sucCountTotal : Number,
  failCountTotal : Number,
  ftTotalAmt : Number,
  ftTotalCount : Number,
  bpeTotalAmt : Number,
  bpeTotalCount : Number,
  bpdTotalAmt : Number,
  bpdTotalCount : Number,
  sales : [salesRecSchema],
  accountTopups : [accountTopupSchema]
    
}, {minimize : false, timestamps : true});
mongoose.Promise = global.Promise;
/*
dailystatSchema.plugin(mongooseToCsv, {
  headers : 'issued batch valid valid_from valid_to serial code value currency'
})
*/
//Return model
module.exports = db.model('dailysummary', dailystatSchema);
