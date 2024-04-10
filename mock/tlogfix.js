require('dotenv').config({path: './../.env'});
const TopupLog = require('../models/topuplog');

async function run() {
    const topups = await TopupLog.find().exec();
    for(let topup of topups) {
        topup.topup_amount = parseFloat(topup.topup_amount);
        topup.paid_amount = parseFloat(topup.paid_amount);
        await TopupLog.update({_id: topup._id}, {
            $set: {
                topup_amount: topup.topup_amount,
                paid_amount: topup.paid_amount
            }
        }).exec();
        console.log('Updating ...', topup._id);
    }

    process.exit(1);
}

run();