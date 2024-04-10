require('dotenv').config({path: './../.env'});
const mongoose = require('mongoose');
const Account = require('../models/account');
const ProfitMap = require('../models/profitmap');

async function run() {
    const accounts = await Account.find().exec();
    for(let account of accounts) {
        const newObjID = mongoose.Types.ObjectId();
        const rec = {
            _id: newObjID,
            active: true,
            time: new Date(),
            maps: [
                {
                    _id: mongoose.Types.ObjectId(),
                    code: 'ALL:ALL',
                    profit_pct: parseFloat(account.profit_pct),
                    active: true,
                    time: new Date()
                }
            ]
        }
        await ProfitMap.create(rec);
        await Account.update({
            _id: account._id
        }, {
            $set: {
                profit_map: newObjID
            }
        }).exec();
        console.log('MIGRATING : ', account.account_name, ' NEW PROFIT MAP :', newObjID); 
    }

    process.exit(1);
}

run();