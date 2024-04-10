require('dotenv').config({path: './../.env'});
const Account = require('../models/account');
const TopupLog = require('../models/topuplog');
const StatHelperAgent = require('./stat_helper_agent');

module.exports = async function run(statTimer, dateFormatter, saveModel) {
    const {start, end, steps} = statTimer;

    const accounts = await Account.find({type: {$nin: ['agent', 'system']}}).exec();
    for(let account of accounts) {
        const accountArr = [];
        const agentAccountArr = [];

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

        accountArr.push(account);

        const accountIDArr = accountArr.map(acc => acc._id);
        const agentAccountIDArr = agentAccountArr.map(acc => acc._id);

        const [destPaidCollection, resCurrencyInDeb, resCurrencyInCrd, resCountByCode, agentAccountPaid, resPaidAmount, resTopupAmount] = await Promise.all([
            StatHelperAgent.getTopupGroupCO(agentAccountIDArr, start, end),
            StatHelperAgent.getTransactionGroupCInDeb(accountIDArr, start, end),
            StatHelperAgent.getTransactionGroupCInCrd(accountIDArr, start, end),
            StatHelperAgent.getTopupGroupCP(agentAccountIDArr, start, end),
            StatHelperAgent.getTopupGroupAP(agentAccountIDArr, start, end),
            StatHelperAgent.getTopupGroupCPOC(agentAccountIDArr, start, end),
            StatHelperAgent.getTopupGroupCTOC(agentAccountIDArr, start, end)
        ])


        const top5Dest = destPaidCollection.map((entry) => {
            return [entry._id.operator_name, entry._id.country]
        })
        
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
        const topAgentArray = [];
        const stats = [];

        agentAccountPaid.forEach(agentPaid => {
            if(topAgentArray.indexOf(agentPaid._id.account) == -1) {
                topAgentArray.push(agentPaid._id.account);
            }
        });
        
        for(let i = steps; i > 0; i--) {
            const timeSpan = statTimer.timeSpanInStep(i);
            const stepStart = timeSpan.start;
            const stepEnd = timeSpan.end;

            const top5DestCountPromises = [];
            for(let entry of top5Dest) {
                top5DestCountPromises.push(new Promise((resolve, reject) => {
                    TopupLog.count({
                        account: {
                            $in: agentAccountIDArr
                        },
                        time: {$gte: stepStart, $lte: stepEnd},
                        operator_name: entry[0],
                        country: entry[1]
                    }).then(val => {
                        resolve({
                            country: entry[1],
                            operator_name: entry[0],
                            count: val
                        })
                    }).catch(err => reject(err))
                }))
            }

            const resAgentPromises = [];
            const resAgentArray = [];
            for(let topAgentId of topAgentArray) {
                resAgentPromises.push(new Promise(async (resolve, reject) => {
                    const [topAgent, paidAmountsOfTopAgent] = await Promise.all([
                        Account.findOne({_id: topAgentId}).exec(),
                        StatHelperAgent.getTopupGroupAPT(topAgentId, stepStart, stepEnd)
                    ])
                    
                    paidAmountsOfTopAgent.forEach(paidAmount => {
                        resAgentArray.push({
                            _id: paidAmount._id,
                            account_name: topAgent.account_name,
                            paid_amount: paidAmount.paid_amount,
                            paid_count: paidAmount.paid_count,
                            topup_amount: paidAmount.topup_amount,
                            topup_count: paidAmount.topup_count
                        });
                    });

                    resolve();
                }))
            }

            const [
                top5DestCount,
                resSuccess, 
                resFail, 
                successCount, 
                failCount, 
                webChannel, 
                apiChannel, 
                pinpChannel, 
                ivrChannel,
                topupsByProduct
            ] = await Promise.all([
                Promise.all(top5DestCountPromises),
                StatHelperAgent.getTopupSuccessAmount(agentAccountIDArr, stepStart, stepEnd),               // resSuccess
                StatHelperAgent.getTopupFailAmount(agentAccountIDArr, stepStart, stepEnd),                  // resFail
                StatHelperAgent.getTopupCountBySuccessStat(agentAccountIDArr, stepStart, stepEnd, true),    // successCount
                StatHelperAgent.getTopupCountBySuccessStat(agentAccountIDArr, stepStart, stepEnd, false),   // failCount
                StatHelperAgent.getTopupCountByChannel(agentAccountIDArr, stepStart, stepEnd, 'web'),       // webChannel
                StatHelperAgent.getTopupCountByChannel(agentAccountIDArr, stepStart, stepEnd, 'api'),       // apiChannel
                StatHelperAgent.getTopupCountByChannel(agentAccountIDArr, stepStart, stepEnd, 'pinp'),      // pinpChannel
                StatHelperAgent.getTopupCountByChannel(agentAccountIDArr, stepStart, stepEnd, 'ivr'),       // ivrChannel
                StatHelperAgent.getTopupsByProduct(agentAccountIDArr, stepStart, stepEnd),                  // by Product
                Promise.all(resAgentPromises),                                                              // resAgentArray
            ])

            const resSuccessAndFail = {
                sux: resSuccess,
                fail: resFail
            };
            
            stats.push({
                top5_dest_count: top5DestCount,
                suxx_vs_fail: {
                    successful: successCount,
                    failed: failCount
                },
                topups_by_channel: {
                    web: webChannel,
                    api: apiChannel,
                    pinp: pinpChannel,
                    ivr: ivrChannel,
                },
                txvolume: {
                    crd: resCurrencyInCrd,
                    deb: resCurrencyInDeb,
                },
                bals: balances,
                dest_suxx_vs_fail: resSuccessAndFail,
                top_agent: resAgentArray,
                topups_by_product: topupsByProduct,
                time: dateFormatter.format(stepStart),
                ts: stepStart
            });
        }

        const obj = {
            account: account._id,
            time: new Date(),
            count_by_code: resCountByCode,
            // dest_count_by_code: resDestCountByCode,
            stats: stats,
            paid_amount: resPaidAmount,
            topup_amount: resTopupAmount
        }
        
        await saveModel.create(obj);
        console.log('Processed one account');
    }
}