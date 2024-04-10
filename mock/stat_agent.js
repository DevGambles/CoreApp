require('dotenv').config({path: './../.env'});
const Account = require('../models/account');
const TopupLog = require('../models/topuplog');

module.exports = async function run(statTimer, dateFormatter, saveModel) {
    const {start, end, steps} = statTimer;
    const accounts = await Account.find({type: 'agent'}).exec();
    for(let account of accounts) {
        const balances = {};

        account.wallets.forEach(wallet => {
            if(balances[wallet.currency]) {
                balances[wallet.currency] += Math.round(wallet.balance * 100) / 100;
            } else {
                balances[wallet.currency] = Math.round(wallet.balance * 100) / 100;
            }
        });

        const pipe = [
            {
                $match: {
                    account: account._id,
                    time: {$gte: start, $lte: end}
                },
            },
            {
                $group: {
                    _id: Object.assign({ 
                        country: '$country', 
                        operator_name: '$operator_name',
                        success: '$success',
                        paid_currency: '$paid_currency',
                        topup_currency: '$topup_currency',
                        type: '$type'
                    }),
                    topup_amount: { $sum: '$topup_amount' },
                    paid_amount: { $sum: '$paid_amount' },
                    count: { $sum: 1 }
                }
            }
        ];
        const topups = await TopupLog.aggregate(pipe).exec();
        
        const spanPipe = [
            {
                $match: {
                    account: account._id,
                    time: {$gte: start, $lte: end}
                },
            },
            {
                $group: {
                    _id: Object.assign({ 
                        country: '$country', 
                        operator_name: '$operator_name',
                        success: '$success',
                        type: '$type',
                        channel: '$channel'
                    }, dateFormatter.aggregate()),
                    topup_amount: { $sum: '$topup_amount' },
                    paid_amount: { $sum: '$paid_amount' },
                    count: { $sum: 1 }
                }
            }
        ];
        const spanTopups = await TopupLog.aggregate(spanPipe).exec();

        const stats = [];
        for(let i = steps; i > 0; i --) {
            const timeSpan = statTimer.timeSpanInStep(i);
            const stepStart = timeSpan.start;
            const stepEnd = timeSpan.end;

            stats.push({
                topups: spanTopups.filter(function (topup) {
                    return dateFormatter.compare(stepStart, stepEnd, topup)
                }),
                time: dateFormatter.format(stepStart),
                ts: stepStart
            });
        }
    
        const obj = {
            account: account._id,
            time: statTimer.time,
            time_from: start,
            time_to: end,
            topups: topups,
            stats: stats,
            bals: balances
        };
        await saveModel.create(obj);
        console.log('Processed one account');
    }
}