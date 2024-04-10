require('dotenv').config({path: './../.env'});
const Account = require('../models/account');
const TopupLog = require('../models/topuplog');
const CoreStat = require('../models/corestat');

async function run() {
    const obj = {};
    const walletArray = [];
    const accs = await Account.find().exec();
    accs.forEach(acc => {
        const warray = acc.wallets;
        warray.forEach(w => {
            walletArray.push({
                _id: w.currency,
                totalAmmount: w.balance,
                account: acc._id,
                account_name: acc.account_name
            });
        });
    })
    console.log('walletarray:', walletArray);
    obj.balances = walletArray;

    const pipe2 = [
        {
            $group: {_id: '$currency', count: {$sum: 1}},
        },
        {
            $sort: {count: -1}
        },
        {
            $limit: 5
        }
    ];
    const res2 = await TopupLog.aggregate(pipe2).exec();

    obj.top5_countries_topup_count = res2;

    const pipe3 = [
        {
            $group: {_id: '$currency', amount: {$sum: '$paid_amount'}}
        },
        {
            $sort: {amount: -1}
        },
        {
            $limit: 5
        }
    ]
    const res3 = await TopupLog.aggregate(pipe3).exec();
    obj.top5_countries_topup_amount = res3;

    const pipe4 = [
        {
            $group: {_id: '$account', amount: {$sum: '$paid_account'}}
        },
        {
            $sort: {amount: -1}
        },
        {
            $limit: 5
        }
    ]
    const res4 = await TopupLog.aggregate(pipe4).exec();
    
    obj.top5_accounts_topup_amount = res4;

    const pipe5 = [
        {
            $group: {_id: '$account', count: {$sum: 1}}
        },
        {
            $sort: {count: -1}
        },
        {
            $limit: 5
        }
    ]
    const res5 = await TopupLog.aggregate(pipe5).exec();
    obj.top5_accounts_topup_count = res5;

    const pipe6 = [
        {
            $group: {_id: '$code', count: {$sum: 1}}
        },
        {
            $sort: { count: -1 }
        }, 
        {
            $limit: 5
        }
    ]
    const res6 = await TopupLog.aggregate(pipe6).exec();

    obj.top5_operations_bycode = res6;
    obj.total_operations_count = await TopupLog.count().exec();
    obj.time = new Date();
    await CoreStat.create(obj);

    
    process.exit(1);
}

run();
