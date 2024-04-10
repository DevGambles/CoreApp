

//dragon created 2017_11_14
var mongoose = require('mongoose');
var mongooseToCsv = require('mongoose-to-csv');
///var db = mongoose.createConnection('mongodb://' + process.env.DBHOST + '/' + process.env.DBNAME);
var db = mongoose.connect(process.env.DBURI, { 
    keepAlive: process.env.KEEP_ALIVE,
    connectTimeoutMS: process.env.CONNECT_TIMEOUT_MS,
    socketTimeoutMS: process.env.SOCKET_TIMEOUT_MS,
    useMongoClient : true,
    promiseLibrary: global.Promise});

var Schema = mongoose.Schema;
//Schema

var yearlycoreSchema = new Schema({
  top10_countries: [],
  top10_destinations: [],
  top10_accounts: [],
  transCount_by_currency: [],
  time: Date,
  stats:[]

}, {minimize : false, timestamps : true});
mongoose.Promise = global.Promise;
/*
yearlystatSchema.plugin(mongooseToCsv, {
  headers : 'issued batch valid valid_from valid_to serial code value currency'
})
*/
//Return model
module.exports = db.model('yearlycorestats', yearlycoreSchema);
