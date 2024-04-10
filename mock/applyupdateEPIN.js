require('dotenv').config({path: './../.env'});
const Account = require('../models/account');

async function run() {
    await Account.update({
        type: 'wholesaler'
    }, {
        '$set': { epin_enabled: false }
    }).exit();
    process.exit(1);
}

run();
