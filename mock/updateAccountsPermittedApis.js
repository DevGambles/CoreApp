require('dotenv').config({path: './../.env'});
const Account = require('../models/account');

async function run() {
    const a = await Account.find({type: 'wholesaler'}).exec();
    for(let b of a) {
        const s = ['TRTO', 'TRLO', 'MFIN', 'ETRX', 'SSLW'];
        await Account.update({_id: b._id}, {$set: {permitted_apis: s}}).exec();
        console.log('Updating : ', b.account_name);
    };

    process.exit(1);
}

run();