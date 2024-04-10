require('dotenv').config({path: './../.env'});
const User = require('../models/user');

async function run () {
    await User.update({}, {
        '$set': {
            pos_access: true,
            sms_access: true,
            account_access: true,
            transactions_access: true,
            pins_access: true,
            jobs_access: true,
            price_access: true,
            topuplog_access: true,
            support_access: true,
            balance_access: true
        }
    }).exec();
    process.exit(1);
}

run();