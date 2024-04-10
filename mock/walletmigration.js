require('dotenv').config({path: './../.env'});
const Account = require('../models/account');
const mongoose = require('mongoose');

async function run() {
    const a = await Account.find().exec();
    for(let b of a) {
        const newacc = b.currency + (parseInt(Math.random() * 89999999) + 10000000).toString();
        const wa = {
            '_id': mongoose.Types.ObjectId(),
            'wallet_name': b.currency + ' Wallet',
            'wallet_id': newacc,
            'currency': b.currency,
            'balance': parseFloat(b.balance),
            'primary': true,
            'active': true,
            'virtual': false,
            'parent_wallet': null
        }
        await Account.update({_id: b._id}, {$push: {wallets: wa}}).exec();
    }

    process.exit(1);
}

run();