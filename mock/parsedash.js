require('dotenv').config({path: './../.env'});
const moment = require('moment');
const Account = require('../models/account');
const Transaction = require('../models/transaction');
const TopupLog = require('../models/topuplog');

async function run () {
    const account = await Account.findOne({
        _id: "5859207abb440b23863a90f8"
    }).exec();

    console.log('Account : ', account.account_name, ' Was created on : ', moment(account.createdAt).format('YYYY-MM-DD HH:mm:ss'));
    const dayStart = new Date(
        account.createdAt.getFullYear(), 
        account.createdAt.getMonth(), 
        account.createdAt.getDate()
    );
    const dayEnd = new Date(
        account.createdAt.getFullYear(), 
        account.createdAt.getMonth(), 
        account.createdAt.getDate(),
        23,
        59,
        59
    );
    txperday = [];
    topperday = [];
    while(dayEnd < new Date()) {
        let today = new Date(dayStart.getFullYear(), dayStart.getMonth(), dayStart.getDate());
        txperday[today] = 0;
        topperday[today] = 0;
        const trx1 = await Transaction.find({
            account: account._id,
            time: {
                $gte: dayStart,
                $lte: dayEnd
            }
        }).exec();
        trx1.forEach(() =>  {
            txperday[today]++;
        })
        const topups = await TopupLog.find({
            account: account._id,
            time: {
                $gte: dayStart,
                $lte: dayEnd
            }
        }).exec();
        topups.forEach(topup => {
            topperday[today] ++;
        })
        dayStart = new Date(dayStart.getTime() + 86400000);
        dayEnd = new Date(dayEnd.getTime() + 86400000);
    }
    console.log(txperday);
    console.log(topperday);
    
    process.exit(1);
}

run();