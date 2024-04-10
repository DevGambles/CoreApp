/* 
* profitmap Schema
* Author : Konstantins Kolcovs
* (c) 2017, OK Media Group LTD.
* File : profitmap.js
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
var entriesSchema = new Schema({
    code : {type : String, index : true},
    profit : Number,
    currency : String,
    rate : Number,
    min_threshold_day : Number,
    min_threshold_month : Number,
    active : Boolean,
    time : Date
}, {minimize : false, timestamps : true})
var profitmapSchema = new Schema({
   active : Boolean,
   maps : [entriesSchema],
   time : Date

    
}, {minimize : false, timestamps : true});
mongoose.Promise = global.Promise;
//Return model
module.exports = db.model('fixedprofitmap', profitmapSchema);
