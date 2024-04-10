require('dotenv').config({path: './../.env'});
const WeeklyStat = require('../models/weeklystat');

const run = require('./stat_whole');
const {MonthDateFormatter, WeeklyStatTimer} = require('./stat_timer');

const runner = require('./stat_runners').onceRunner;

runner(run.bind(null, new WeeklyStatTimer(), new MonthDateFormatter(), WeeklyStat))

// async function run() {
//     const accounts = await Account.find({type: {$nin: ['agent', 'system']}}).exec();
//     for(let account of accounts) {
//         const accountArr = [];
//         const agentAccountArr = [];

//         const pAccounts = await Account.find({parent: account._id}).exec();

//         for(let pAccount of pAccounts) {
//             accountArr.push(pAccount);
//             if(pAccount.type === 'agent') {
//                 agentAccountArr.push(pAccount);
//             }
//             const ppAccounts = await Account.find({parent: pAccount._id}).exec();
//             ppAccounts.forEach(ppAccount => {
//                 accountArr.push(ppAccount);
//                 if(ppAccount.type == 'agent') {
//                     agentAccountArr.push(ppAccount);
//                 }
//             });
//         }

//         accountArr.push(account);

//         const accountIDArr = accountArr.map(acc => acc._id);
//         const agentAccountIDArr = agentAccountArr.map(acc => acc._id);

//         const currentTime = new Date();
//         const startOfMonth = new Date(currentTime.getTime() - 86400000 * 7);
        
//         const destPaidCollection = await StatHelperAgent.getTopupGroupCO(agentAccountIDArr, startOfMonth, currentTime);
//         const top5 = {};
//         const top5Amount = {};
        
//         destPaidCollection.forEach(destPaid => {
//             const paidGroup = destPaid._id;
//             if(paidGroup.operator_name) {
//                 top5[paidGroup.country + '-' + paidGroup.operator_name] = [paidGroup.operator_name, paidGroup.country];
//             }
//         })
//         const resCurrencyInDeb = await StatHelperAgent.getTransactionGroupCInDeb(accountIDArr, startOfMonth, currentTime);
//         const resCurrencyInCrd = await StatHelperAgent.getTransactionGroupCInCrd(accountIDArr, startOfMonth, currentTime);
//         const resCountByCode = await StatHelperAgent.getTopupGroupCP(agentAccountIDArr, startOfMonth, currentTime);
//         // const resDestCountByCode = await StatHelperAgent.getTopupGroupCPCO(agentAccountIDArr, startOfMonth, currentTime);
//         const balances = {};

//         accountArr.forEach(acc => {
//             acc.wallets.forEach(wallet => {
//                 if(balances[wallet.currency]) {
//                     balances[wallet.currency] += Math.round(wallet.balance * 100) / 100;
//                 } else {
//                     balances[wallet.currency] = Math.round(wallet.balance * 100) / 100;
//                 }
//             });
//         })
//         const agentAccountPaid = await StatHelperAgent.getTopupGroupAP(agentAccountIDArr, startOfMonth, currentTime);
//         const topAgentArray = [];
//         const agentPaidArray = agentAccountPaid;
//         const stats = [];

//         agentPaidArray.forEach(agentPaid => {
//             if(topAgentArray.indexOf(agentPaid._id.account) == -1) {
//                 topAgentArray.push(agentPaid._id.account);
//             }
//         });
        
//         for(let i = 7; i > 0; i--) {
//             const start = new Date(currentTime.getTime() - 86400000 * i);
//             const end = new Date(start.getTime() + 86400000);
//             const top5DestCount = [];
//             const top5DestAmount = [];

//             for(let entry of Object.values(top5)) {
//                 const topupDestCount = await TopupLog.count({
//                     account: {
//                         $in: agentAccountIDArr
//                     },
//                     time: {$gte: start, $lte: end},
//                     operator_name: entry[0],
//                     country: entry[1]
//                 }).exec();

//                 top5DestCount.push({
//                     country: entry[1],
//                     operator_name: entry[0],
//                     count: topupDestCount,
//                     date: moment(start).format('DD.MM.YYYY'),
//                     ts: end
//                 });
//             }

//             for(let entry of Object.values(top5Amount)) {
//                 const topups = await TopupLog.find({
//                     account: {
//                         $in: agentAccountIDArr
//                     },
//                     time: {$gte: start, $lte: end},
//                     operator_name: entry[0],
//                     country: entry[1]
//                 }).exec();

//                 const topupAmount = topups.reduce((acc, val) => {
//                     return acc + parseFloat(val.paid_amount);
//                 }, 0);
//                 top5DestAmount.push({
//                     country: entry[1],
//                     operator_name: entry[0],
//                     amount: topupAmount,
//                     ts: end
//                 });
//             }

//             const resAgentArray = [];
//             for(let topAgentId of topAgentArray) {
//                 const topAgent = await Account.findOne({_id: topAgentId}).exec();
//                 const paidAmountsOfTopAgent = await StatHelperAgent.getTopupGroupAPT(topAgentId, start, end);
//                 paidAmountsOfTopAgent.forEach(paidAmount => {
//                     resAgentArray.push({
//                         _id: paidAmount._id,
//                         account_name: topAgent.account_name,
//                         paid_amount: paidAmount.paid_amount,
//                         paid_count: paidAmount.paid_count,
//                         topup_amount: paidAmount.topup_amount,
//                         topup_count: paidAmount.topup_count
//                     });
//                 });
//             }

//             const resSuccess = await StatHelperAgent.getTopupSuccessAmount(agentAccountIDArr, start, end);
//             const resFail = await StatHelperAgent.getTopupFailAmount(agentAccountIDArr, start, end);
//             const resSuccessAndFail = {
//                 sux: resSuccess,
//                 fail: resFail,
//                 ts: end
//             };
//             const successCount = await StatHelperAgent.getTopupCountBySuccessStat(agentAccountIDArr, start, end, true);
//             const failCount = await StatHelperAgent.getTopupCountBySuccessStat(agentAccountIDArr, start, end, false);

//             const webChannel = await StatHelperAgent.getTopupCountByChannel(agentAccountIDArr, start, end, 'web');
//             const apiChannel = await StatHelperAgent.getTopupCountByChannel(agentAccountIDArr, start, end, 'api');
//             const pinpChannel = await StatHelperAgent.getTopupCountByChannel(agentAccountIDArr, start, end, 'pinp');
//             const ivrChannel = await StatHelperAgent.getTopupCountByChannel(agentAccountIDArr, start, end, 'ivr');

//             stats.push({
//                 top5_dest_count: top5DestCount,
//                 top5_dest_amount: top5DestAmount,
//                 suxx_vs_fail: {
//                     successful: successCount,
//                     failed: failCount,
//                     date: moment(start).format('DD.MM.YYYY'),
//                     ts: end
//                 },
//                 topups_by_channel: {
//                     web: webChannel,
//                     api: apiChannel,
//                     pinp: pinpChannel,
//                     ivr: ivrChannel,
//                     date: moment(start).format('DD.MM.YYYY'),
//                     ts: end
//                 },
//                 txvolume: {
//                     crd: resCurrencyInCrd,
//                     deb: resCurrencyInDeb,
//                     ts: end
//                 },
//                 bals: balances,
//                 dest_suxx_vs_fail: resSuccessAndFail,
//                 top_agent: resAgentArray,
//                 time: moment(start).format('DD.MM.YYYY')
//             });
//         }

//         const resPaidAmount = await StatHelperAgent.getTopupGroupCPOC(agentAccountIDArr, startOfMonth, currentTime);
//         const resTopupAmount = await StatHelperAgent.getTopupGroupCTOC(agentAccountIDArr, startOfMonth, currentTime);

//         const obj = {
//             account: account._id,
//             time: currentTime,
//             count_by_code: resCountByCode,
//             // dest_count_by_code: resDestCountByCode,
//             stats: stats,
//             paid_amount: resPaidAmount,
//             topup_amount: resTopupAmount
//         }
//         await WeeklyStat.create(obj);
//         console.log('Processed one account');
//     }
// }

// try{
//     await run();
// } catch(e) {
// } finally {
//     process.exit(1);
// }
