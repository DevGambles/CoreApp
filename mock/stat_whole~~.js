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
                        topup_currency: '$topup_currency',
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
       
        const topups = await TopupLog.aggregate(pipe).exec(); 
        console.log('-Total memory size-', StatHelperAgent.memorySizeOf(topups));
        const stats = [];

        for(let i = steps; i > 0; i--) {
            const timeSpan = statTimer.timeSpanInStep(i);
            const stepStart = timeSpan.start;
            const stepEnd = timeSpan.end;
            
            stats.push({
                topups: topups.filter(function(topup) {return dateFormatter.compare(stepStart, stepEnd, topup)}),
                time: dateFormatter.format(stepStart),
                ts: stepStart
            });
        }

        const obj = {
            account: account._id,
            time: new Date(),
            stats: stats,
        }
        
        await saveModel.create(obj);
        console.log('Processed one account');
    }
}