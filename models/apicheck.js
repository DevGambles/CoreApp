
var mongoose = require('mongoose');
//var db = mongoose.createConnection('mongodb://' + process.env.DBHOST + '/' + process.env.DBNAME);
var db = mongoose.connect(process.env.DBURI, { 
    keepAlive: process.env.KEEP_ALIVE,
    connectTimeoutMS: process.env.CONNECT_TIMEOUT_MS,
    socketTimeoutMS: process.env.SOCKET_TIMEOUT_MS,
    useMongoClient : true,
    promiseLibrary: global.Promise});
var Schema = mongoose.Schema;
//Schema

var apicheckSchema = new Schema({
   state : {type : String, enum : ['new', 'proc', 'fin']},
   data : [],
   result : []
    
}, {minimize : false, timestamps : true});
mongoose.Promise = global.Promise;
//Return model
module.exports = db.model('apicheck', apicheckSchema);
