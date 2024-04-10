require('dotenv').config()
let SCCS = require('./models/scc');
(async () => {
    let al = await SCCS.findOneAndUpdate({}, {global_accdb_lastcheck : new Date(), global_anldb_lastcheck : new Date()}).exec();
    process.exit(0);
})();