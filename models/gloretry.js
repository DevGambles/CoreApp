var mongoose = require('mongoose');
var db = mongoose.connect(process.env.DBURI, { keepAlive: 30000,
  connectTimeoutMS: 30000,
    useMongoClient : true,
  socketTimeoutMS: 30000,
  promiseLibrary: global.Promise});
//var db = mongoose.createConnection('mongodb://' + process.env.DBHOST + '/' + process.env.DBNAME );
var Schema = mongoose.Schema;
//Schema

var transactionSchema = new Schema({
  time : {type : Date, default : Date.now, required : true, index : true},
  tlid : Schema.Types.ObjectId,
  sobj : [],
  cobj : [],
  txkey : {type : String, index : true, unique : true},
  state : {type : String}
    
}, {minimize : false, timestamps : true});
mongoose.Promise = global.Promise;
//Return model
module.exports = db.model('gloretry', transactionSchema);
