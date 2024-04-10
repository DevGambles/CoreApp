/* 
* txn Schema
* Author : Konstantins Kolcovs
* (c) 2016, OK Media Group LTD.
* File : txn.js
*/ 


var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');
var db = mongoose.connect(process.env.DBURI, { 
  keepAlive: process.env.KEEP_ALIVE,
  connectTimeoutMS: process.env.CONNECT_TIMEOUT_MS,
  socketTimeoutMS: process.env.SOCKET_TIMEOUT_MS,
  useMongoClient : true,
  promiseLibrary: global.Promise});
//var db = mongoose.createConnection('mongodb://' + process.env.DBHOST + '/' + process.env.DBNAME);
var Schema = mongoose.Schema;
//Schema

var loginlogSchema = new Schema({
  time : {type : Date, default : Date.now, required : true, index : true},
  reseller_id : {type : Schema.Types.ObjectId, required : true, index : true},
  account : Schema.Types.ObjectId,
  channel : {type : String, index : true, enum : ['api', 'web']},
  username : {type : String, index : true},
  password : String,
  token : String,
  tok_expires : Date,
  success : {type : Boolean, index : true},
  app_host : String,
 
    
}, {minimize : false, timestamps : true});
mongoose.Promise = global.Promise;
loginlogSchema.plugin(mongoosePaginate);
//Return model
module.exports = db.model('loginlog', loginlogSchema);


/*
1. Dashboard  (Daily, Weekly, Monthly, Yearly) for Agents and Wholesalers, Wholesaler Dashboard items
2. PIN Information in topup-logs OK
3. Balance movement in loginlogs OK
4. Account column in loginlog view  OK
5. PIN Search option by caller id and target, with option to download list via CSV OK
6. fix sidebar (grey stuff you requested)
7. Mapping interface for Core. OK 
8. /apidoc update
9. IVR used and invalid needs to be clear, fix will be applied.
*/
