require('dotenv').config({path: './../.env'});
const Account = require('../models/account');
const StatHelperAgent = require('./stat_helper_agent');
const TopupLog = require('../models/topuplog');

module.exports = async function run(statTimer, dateFormatter, saveModel) {
    const {start, end, steps} = statTimer;
    const accounts = await Account.find({type: 'agent'}).exec();

    for(let account of accounts) {
        let [resTopupGroupCO, resTopupPaidGroupCO, resAmountByCode, resPaidAmount, resTopupAmount] = await Promise.all([
            StatHelperAgent.getTopupGroupCO(account._id, start, end),
            StatHelperAgent.getTopupPaidGroupCO(account._id, start, end),
            StatHelperAgent.getTopupGroupCP(account._id, start, end),
            StatHelperAgent.getTopupGroupCPOC(account._id, start, end),
            StatHelperAgent.getTopupGroupCTOC(account._id, start, end)
        ])
        
        const top5 = resTopupGroupCO.map(entry => {
            const account = entry._id;
            return [account.operator_name, account.country];
        });
        resTopupGroupCO = null;

        const top5Amount = resTopupPaidGroupCO.map(entry => {
            const account = entry._id;
            return [account.operator_name, account.country];
        });
        resTopupPaidGroupCO = null;
        
        const stats = [];
        for(let i = steps; i > 0; i --) {
            const timeSpan = statTimer.timeSpanInStep(i);
            const stepStart = timeSpan.start;
            const stepEnd = timeSpan.end;

            const top5DestCountPromises = [];
            for(let entry of top5) {
                top5DestCountPromises.push(new Promise(async (resolve, reject) => {
                    try{
                        const topupCount = await TopupLog.count({
                            account: account._id,
                            time: { $gte: stepStart, $lte: stepEnd },
                            operator_name: entry[0],
                            country: entry[1]
                        }).exec();
        
                        resolve({
                            country: entry[1],
                            operator_name: entry[0],
                            count: topupCount,
                            date: dateFormatter(stepStart),
                            ts: end
                        });
                    } catch(e) {
                        reject(e);
                    }
                    
                }));   
            }
    
            const top5DestAmountPromises = [];
            for(let entry of top5Amount) {
                top5DestAmountPromises.push(new Promise(async (resolve, reject) => {
                    try {
                        const topups = await TopupLog.find({
                            account: account._id,
                            time: { $gte: start, $lte: end },
                            operator_name: entry[0],
                            country: entry[1]
                        }).exec();
            
                        const topupAmount = topups.reduce((acc, val) => {
                            return acc + parseFloat(val.paid_amount);
                        }, 0);
        
                        resolve({
                            country: entry[1],
                            operator_name: entry[0],
                            amount: topupAmount,
                            ts: end
                        });
                    } catch(e) {
                        reject(e);
                    }
                    
                }));
                
            }
    
            const [
                top5DestCount, 
                top5DestAmount, 
                resSuccess, 
                resFail, 
                successfulCount, 
                failCount, 
                webChannelCount, 
                apiChannelCount, 
                pinpChannelCount, 
                ivrChannelCount
            ] = await Promise.all([
                Promise.all(top5DestCountPromises),
                Promise.all(top5DestAmountPromises),
                StatHelperAgent.getTopupSuccessAmount(account._id, stepStart, stepEnd),
                StatHelperAgent.getTopupFailAmount(account._id, stepStart, stepEnd),
                StatHelperAgent.getTopupCountBySuccessStat(account._id, stepStart, stepEnd, true),
                StatHelperAgent.getTopupCountBySuccessStat(account._id, stepStart, stepEnd, false),
                StatHelperAgent.getTopupCountByChannel(account._id, stepStart, stepEnd, 'web'),
                StatHelperAgent.getTopupCountByChannel(account._id, stepStart, stepEnd, 'api'),
                StatHelperAgent.getTopupCountByChannel(account._id, stepStart, stepEnd, 'pinp'),
                StatHelperAgent.getTopupCountByChannel(account._id, stepStart, stepEnd, 'ivr')
            ])
            const destSuccessFail = {
                sux: resSuccess,
                fail: resFail,
                ts: end
            };
    
            stats.push({
                top5_dest_count: top5DestCount,
                top5_dest_amount: top5DestAmount,
                suxx_vs_fail: {
                    successful: successfulCount,
                    failed: failCount,
                    date: dateFormatter(stepStart),
                    ts: end
                },
                topups_by_channel: {
                    web: webChannelCount,
                    api: apiChannelCount,
                    pinp: pinpChannelCount,
                    ivr: ivrChannelCount,
                    date: dateFormatter(stepStart),
                    ts: end
                },
                dest_suxx_vs_fail: destSuccessFail,
                time: dateFormatter(stepStart)
            });
        }
    
        const obj = {
            account: account._id,
            time: end,
            time_from: start,
            time_to: end,
            amounts_by_code: resAmountByCode,
            stats: stats,
            paid_amount: resPaidAmount,
            topup_amount: resTopupAmount
        };
        await saveModel.create(obj);
        console.log('Processed one account');
    }
}