var mongoose = require('mongoose');
var db = mongoose.connect(process.env.DBURI, { 
    keepAlive: process.env.KEEP_ALIVE,
    connectTimeoutMS: process.env.CONNECT_TIMEOUT_MS,
    socketTimeoutMS: process.env.SOCKET_TIMEOUT_MS,
    useMongoClient : true,
    promiseLibrary: global.Promise});
//var db = mongoose.createConnection('mongodb://' + process.env.DBHOST + '/' + process.env.DBNAME);
var BulklistEntry = require('./bulklistentry');
var Schema = mongoose.Schema;

//Schema


var bulklistSchema = new Schema({
    tag: { type: String, required: true },
    entries: { type: [BulklistEntry], required: true },
    account: Schema.Types.ObjectId,
    requested_by: Schema.Types.ObjectId,
    created: { type: Date, default: Date.now, required: true, index: true },
    updated: Date

}, { minimize: false, timestamps: true });
mongoose.Promise = global.Promise;
//Return model
module.exports = db.model('bulklist', bulklistSchema);
