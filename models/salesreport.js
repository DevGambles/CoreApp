/* 
* Account Schema
* Author : seuntech
* (c) 2021, seuntech.
* File : salesreport.js
*/ 


var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');
//var db = mongoose.createConnection('mongodb://' + process.env.DBHOST + '/' + process.env.DBNAME);
var db = mongoose.connect(process.env.DBURI, { keepAlive: 30000,
    connectTimeoutMS: 30000,
    useMongoClient : true,
    socketTimeoutMS: 30000,
    promiseLibrary: global.Promise});
var Schema = mongoose.Schema;
//Schema
var salesreportSchema = new Schema({
   date : {type : String, index : true, index : {unique : true}},
   bp :  {
       prime : {type : String,  required : false, default: "0"},
       vendor : {type : String,  required : false, default: "0"}
   },
   pu : {
       prime : {type : String,  required : false, default: "0"},
       vendor : {type : String,  required : false, default: "0"}
   },
   pu_undefined:{type : String,  required : false, default: "0"},
   ft : {
       prime : {type : String,  required : false, default: "0"},
       vendor : {type : String,  required : false, default: "0"}
   },
   ir : {
       prime : {type : String,  required : false, default: "0"},
       vendor : {type : String,  required : false, default: "0"}
   },
   ir_undefined : {type : String,  required : false, default: "0"},
   ir_unttaged : {type : String,  required : false, default: "0"},
   duplicate_electricity : [],
   bpcache : {type : String,  required : false, default: "0"}
    
}, {minimize : false, timestamps : true});
mongoose.Promise = global.Promise;
salesreportSchema.plugin(mongoosePaginate);
//Return model
module.exports = db.model('salesreport', salesreportSchema);
