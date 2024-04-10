require('dotenv').config({path: './../.env'});
const Account = require('../models/account');
const Rate = require('../models/rate');

async function run() {
    await Account.update({}, {'$set': { canEditOwnAcl: true }}).exec();
    await Rate.update({}, {'$sets': {dynamic: false}}).exec();
    process.exit(1);
}

run();