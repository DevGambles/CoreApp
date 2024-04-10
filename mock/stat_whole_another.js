require('dotenv').config({path: './../.env'});
const Account = require('../models/account');
const TopupLog = require('../models/topuplog');
const StatHelperAgent = require('./stat_helper_agent');

module.exports = async function run(statTimer, dateFormatter, saveModel) {
    const {start, end, steps} = statTimer;

    const accounts = await Account.find({type: {$nin: ['agent', 'system']}}).exec();
    for(let account of accounts) {
        const agentAccountArr = [];

        const pAccounts = await Account.find({parent: account._id}).exec();

        for(let pAccount of pAccounts) {
            if(pAccount.type === 'agent') {
                agentAccountArr.push(pAccount);
            }
            const ppAccounts = await Account.find({parent: pAccount._id}).exec();

            for(let ppAccount of ppAccounts) {
                if(ppAccount.type == 'agent') {
                    agentAccountArr.push(ppAccount);
                }
            }
        }

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
                        code: '$code',
                        paid_currency: '$paid_currency',
                        type: '$type',
                        account: '$account'
                    }),
                    paid_amount: { $sum: '$paid_amount' },
                    count: { $sum: 1 }
                }
            }
        ];
        const paidTopups = await TopupLog.aggregate(pipe).exec();
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
                        type: '$type',
                        account: '$account',
                        topup_currency: '$topup_currency',
                    }),
                    topup_amount: { $sum: '$topup_amount' },                    
                    count: { $sum: 1 }
                }
            }
        ];

        const topupTopups = await TopupLog.aggregate(pipe).exec(); 
        console.log('-Total memory size-', StatHelperAgent.memorySizeOf([paidTopups, topupTopups]));

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
                        code: '$code',
                        paid_currency: '$paid_currency',
                        topup_currency: '$topup_currency',
                        type: '$type',
                        account: '$account'
                    }),
                    paid_amount: { $sum: '$paid_amount' },
                    topup_amount: { $sum: '$topup_amount' },
                    count: { $sum: 1 }
                }
            }
        ];
        const allTopups = await TopupLog.aggregate(pipe).exec();
        console.log('-Total memory size-', StatHelperAgent.memorySizeOf(allTopups));
        console.log('Processed one account');
    }
}