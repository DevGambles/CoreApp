require('dotenv').config({path: './../.env'});
const Account = require('../models/account');

async function run() {
    const accounts = await Account.find().exec();
    accounts.forEach(account => {
        if(account.whitelabel_opts && account.whitelabel_opts.portal_url) {
            const nl = account.whitelabel_opts.portal_url.replace('com', 'org');
            console.log('WL : ', account.whitelabel_opts.portal_url);
        }
    });
    
    process.exit(1);
}

run();