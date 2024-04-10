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
var epindbSchema = new Schema({
  system_online : Boolean,
  subsystem_version : String,
  global_system_status : {type : String, enum : ['online', 'offline', 'degraded'], index : true},
  global_core_online : Boolean,
  global_b2b_online : Boolean,
  global_core_version : String,
  global_b2b_version : String,
  global_db_monitoring_active : Boolean,
  global_vpn_monitoring_active : Boolean,
  global_vpn_control_active : Boolean,
  global_tx_monitoring_active : Boolean,
  global_balance_monitoring_active : Boolean,
  global_balance_reporting_active : Boolean,
  global_accdb_mode : {type : String, enum : ['learn', 'active', 'resync', 'offline', 'out-of-sync']},
  global_accdb_status : {type : String, enum : ['sync', 'offline', 'online', 'out-of-sync']},
  global_accdb_lastcheck : Date,
  global_accdb_progress : String,
  global_accdb_syncneeded : Boolean,
  global_anldb_mode : {type : String, enum : ['learn', 'active', 'offline', 'resync', 'out-of-sync']},
  global_anldb_status : {type : String, enum : ['sync', 'offline', 'online', 'out-of-sync']},
  global_anldb_lastcheck : Date,
  global_anldb_progress : String,
  global_anldb_syncneeded : Boolean,
  peracc_tx_monitoring_active : Boolean,
  peracc_tx_reporting_active : Boolean,
  peracc_skype_channel_active : Boolean,
  peracc_slack_channel_active : Boolean

    
}, {minimize : false, timestamps : true});
mongoose.Promise = global.Promise;
/*
epindbSchema.plugin(mongooseToCsv, {
  headers : 'issued batch valid valid_from valid_to serial code value currency'
})
*/
//Return model
module.exports = db.model('scc', epindbSchema);
