require('dotenv').config({path: './../.env'});
const WeeklyCore = require('../models/weeklycore');

const run = require('./stat_core');
const {MonthDateFormatter, WeeklyStatTimer} = require('./stat_timer');

const runner = require('./stat_runners').onceRunner;

runner(run.bind(null, new WeeklyStatTimer(), new MonthDateFormatter(), WeeklyCore))


// async function run() {
//     const agentAccounts = await Account.find({type: 'agent'}).exec();
//     const agentAccountIDArr = agentAccounts.map((obj) => obj._id);
//     const currentTime = new Date();
//     let start = new Date(currentTime.getTime() - 86400000 * 7);
//     let end = currentTime;

//     obj = {};
//     const resTop10Countries = await StatHelperCore.getTopupGroupCountry(null, start, end);
//     obj.top10_countries = resTop10Countries;

//     const resTop10Dest = await StatHelperCore.getTopupGroupDest(null, start, end);
//     obj.top10_destinations = resTop10Dest;

//     const resTop10Account = await StatHelperCore.getTopupGroupAccount(null, start, end);
//     const accountArray = [];
//     for(let topAccount of resTop10Account) {
//         const account = await Account.findOne({_id: topAccount._id}).exec();
//         accountArray.push({
//             _id: topAccount._id,
//             name: account.account_name,
//             count: topAccount.count
//         });
//     }

//     obj.top10_accounts = accountArray;

//     const resTrans = await StatHelperCore.getTransactionGroupCurrency(null, start, end);
//     obj.transCount_by_currency = resTrans;
//     if(obj.top10_accounts.length == 0 || obj.top10_countries.length == 0) {
//         return
//     }

//     const objArray = [];
//     for(let i = 7; i > 0; i --) {
//         const start_mo = new Date(end.getTime() - 86400000 * i);
//         const end_mo = new Date(start_mo.getTime() + 86400000);
//         const top10CountriesTopup = [];
//         const top10AccountsTopup = [];
//         const top10AccountsPaid = [];
//         const top10CountriesPaid = [];

//         for(let countryEntry of resTop10Countries) {
//             const resCountriesTopup = await StatHelperCore.getTopupGroupCTCOT(null, countryEntry._id, start_mo, end_mo);
//             resCountriesTopup.forEach(entry => {
//                 top10CountriesTopup.push({
//                     _id: entry._id.country,
//                     count: entry.count,
//                     country: entry._id.country,
//                     currency: entry._id.currency,
//                     amount: entry.amount,
//                     code: entry._id.code,
//                     operator_name: entry._id.operator_name,
//                     tag: entry._id.tag,
//                     type: entry._id.type
//                 });
//             })
            
//             const resCountriesPaid = await StatHelperCore.getTopupGroupCPCOT(null, countryEntry._id, start_mo, end_mo);
//             resCountriesPaid.forEach(entry => {
//                 top10CountriesPaid.push({
//                     _id: entry._id.country,
//                     count: entry.count,
//                     country: entry._id.country,
//                     currency: entry._id.currency,
//                     amount: entry.amount,
//                     code: entry._id.code,
//                     operator_name: entry._id.operator_name,
//                     tag: entry._id.tag,
//                     type: entry._id.type
//                 })
//             })
//         }

//         for(let account of obj.top10_accounts) {
//             const objId = account._id;
//             const accObj = await Account.findOne({_id: objId}).exec();
//             const parentAccObj = await Account.findOne({_id: accObj.parent}).exec();

//             const resAccountsTopup = await StatHelperCore.getTopupGroupATCCOT(account._id, start_mo, end_mo);
//             resAccountsTopup.forEach(entry => {
//                 top10AccountsTopup.push({
//                     _id: entry._id.account,
//                     account_name: accObj.account_name,
//                     count: entry.count,
//                     currency: entry._id.currency,
//                     amount: entry.amount,
//                     code: entry._id.code,
//                     country: entry._id.country,
//                     operator_name: entry._id.operator_name,
//                     parentid: parentAccObj._id,
//                     parentname: parentAccObj.account_name,
//                     tag: entry._id.tag,
//                     type: entry._id.type
//                 })
//             })

//             const resAccountsPaid = await StatHelperCore.getTopupGroupAPCCOT(account._id, start_mo, end_mo);
//             resAccountsPaid.forEach(entry => {
//                 top10AccountsPaid.push({
//                     _id: entry._id.account,
//                     account_name: accObj.account_name,
//                     count: entry.count,
//                     currency: entry._id.currency,
//                     amount: entry.amount,
//                     code: entry._id.code,
//                     country: entry._id.country,
//                     operator_name: entry._id.operator_name,
//                     parentid: parentAccObj._id,
//                     parentname: parentAccObj.account_name,
//                     tag: entry._id.tag,
//                     type: entry._id.type
//                 });
//             });
//         }

//         const successful = await StatHelperCore.getTopupCountBySuccessStat(agentAccountIDArr, start_mo, end_mo, true);
//         const fail = await StatHelperCore.getTopupCountBySuccessStat(agentAccountIDArr, start_mo, end_mo, false);
//         const webChannel = await StatHelperCore.getTopupCountByChannel(agentAccountIDArr, start_mo, end_mo, 'web');
//         const apiChannel = await StatHelperCore.getTopupCountByChannel(agentAccountIDArr, start_mo, end_mo, 'api');
//         const pinpChannel = await StatHelperCore.getTopupCountByChannel(agentAccountIDArr, start_mo, end_mo, 'pinp');
//         const ivrChannel = await StatHelperCore.getTopupCountByChannel(agentAccountIDArr, start_mo, end_mo, 'ivr');

//         const stats = {
//             suxx_vs_fail: {
//                 successful: successful,
//                 failed: fail
//             },
//             topups_by_channel: {
//                 web: webChannel,
//                 api: apiChannel,
//                 pinp: pinpChannel,
//                 ivr: ivrChannel,
//             },
//             top10_countries_topup: top10CountriesTopup,
//             top10_accounts_topup: top10AccountsTopup,
//             top10_accounts_paid: top10AccountsPaid,
//             top10_countries_paid: top10CountriesPaid,
//             time: moment(start_mo).format('DD.MM.YYYY'),
//             ts: end_mo
//         }
//         objArray.push(stats);
//     }
//     obj.stats = objArray;
//     obj.time = new Date();
//     await WeeklyCore.create(obj);
// }

// try{
//     await run();
// } catch(e) {
// } finally {
//     process.exit(1);
// }
