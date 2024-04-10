require('dotenv').config({path: './../.env'});
const Transaction = require('../models/transaction');

async function run() {
    const a = await Transaction.find().exec();
    for(let v of a) {
        v.amount = parseFloat(v.amount);
        await Transaction.update({_id: a._id}, {$set: {amount: v.amount}}).exec();
        console.log('Updating ...', v._id);
    }

    process.exit(1);
}

run();