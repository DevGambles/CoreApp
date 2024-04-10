/*
* bulklistjob Schema
* Author : Konstantins Kolcovs
* (c) 2016, OK Media Group LTD.
* File : bulklistjob.js
*/


var mongoose = require('mongoose');
var BulklistEntry = require('./bulklistentry');
var db = mongoose.connect(process.env.DBURI, { 
    keepAlive: process.env.KEEP_ALIVE,
    connectTimeoutMS: process.env.CONNECT_TIMEOUT_MS,
    socketTimeoutMS: process.env.SOCKET_TIMEOUT_MS,
    useMongoClient : true,
    promiseLibrary: global.Promise});
var Schema = mongoose.Schema;

//Schema
var Error = new Schema({
    message: String,
    code: String,
    status: Number
});

var Product = new Schema({
    product_id: {type: String, required: true},
    topup_currency: {type: String, required: true},
    openRange: {type: Boolean, required: true},
    openRangeMin: {type: String, required: false},
    openRangeMax: {type: String, required: false},
    step: {type: String, required: false},
    rate: {type: String, required: false},
    currency: {type: String, required: true},
    denomination: {type: String, required: false},
    price: {type: String, required: false},
});

var bulklistjobSchema = new Schema({
    batchid : {type : String, required : true, index : true},
    account: Schema.Types.ObjectId,
    requested_by : Schema.Types.ObjectId,
    entries: { type: [BulklistEntry], required: true },
    time : Date,
    state : {type : String, enum : ['new', 'processing', 'fail', 'success']},
    results : [Product],
    error: [Error],
    completed_at : Date

}, {minimize : false, timestamps : true, usePushEach: true});

mongoose.Promise = global.Promise;
//Return model
module.exports = db.model('bulklistjob', bulklistjobSchema);
