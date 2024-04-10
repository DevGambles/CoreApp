require('dotenv').config({path: './../.env'});
const Account = require('../models/account');
const TopupLog = require('../models/topuplog');
const StatHelperAgent = require('./stat_helper_agent');

module.exports = async function run(statTimer, dateFormatter, saveModel) {
    const {start, end, steps} = statTimer;

    const accounts = await Account.find({type: {$nin: ['agent', 'system']}}).exec();
    for(let account of accounts) {
        const agentAccountArr = [];
        const accountArr = [];

        const pAccounts = await Account.find({parent: account._id}).exec();

        for(let pAccount of pAccounts) {
            accountArr.push(pAccount);
            if(pAccount.type === 'agent') {
                agentAccountArr.push(pAccount);
            }
            const ppAccounts = await Account.find({parent: pAccount._id}).exec();

            for(let ppAccount of ppAccounts) {
                accountArr.push(ppAccount);
                if(ppAccount.type == 'agent') {
                    agentAccountArr.push(ppAccount);
                }
            }
        }

        const balances = {};

        accountArr.forEach(acc => {
            acc.wallets.forEach(wallet => {
                if(balances[wallet.currency]) {
                    balances[wallet.currency] += Math.round(wallet.balance * 100) / 100;
                } else {
                    balances[wallet.currency] = Math.round(wallet.balance * 100) / 100;
                }
            });
        })

        const agentAccountIDArr = agentAccountArr.map(acc => acc._id);

        const pipe = [
            {
                $match: {
                    account: {$in: agentAccountIDArr},
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
                        type: '$type',
                        account: '$account'
                    }),
                    topup_amount: { $sum: '$topup_amount' },
                    paid_amount: { $sum: '$paid_amount' },
                    count: { $sum: 1 }
                }
            }
        ];
        const topups = await TopupLog.aggregate(pipe).exec();

        for(let topup of topups) {
            let agent = agentAccountArr.find(function (agent) {
                return agent._id.toString() == topup._id.account;
            });
            topup._id.account_name = agent.account_name;
        }

        const spanPipe = [
            {
                $match: {
                    account: {$in: agentAccountIDArr},
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
                        channel: '$channel',
                        account: '$account'
                    }, dateFormatter.aggregate()),
                    topup_amount: { $sum: '$topup_amount' },
                    paid_amount: { $sum: '$paid_amount' },
                    count: { $sum: 1 }
                }
            }
        ];
        const spanTopups = await TopupLog.aggregate(spanPipe).exec();

        const stats = [];
        for(let i = steps; i > 0; i--) {
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
        }
        
        await saveModel.create(obj);
        console.log('Processed one account');
    }
}