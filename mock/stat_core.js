require('dotenv').config({path: './../.env'});
const Account = require('../models/account');
const StatHelperCore = require('./stat_helper_core');

module.exports = async function run(statTimer, dateFormatter, saveModel) {
    const agentAccounts = await Account.find({type: 'agent'}).exec();
    const agentAccountIDArr = agentAccounts.map((obj) => obj._id);
    const {start, end, steps} = statTimer;

    obj = {};

    const [resTop10Countries, resTop10Dest, resTop10Account, resTrans] = await Promise.all([
        StatHelperCore.getTopupGroupCountry(agentAccountIDArr, start, end),
        StatHelperCore.getTopupGroupDest(agentAccountIDArr, start, end),
        StatHelperCore.getTopupGroupAccount(agentAccountIDArr, start, end),
        StatHelperCore.getTransactionGroupCurrency(agentAccountIDArr, start, end)
    ])

    obj.top10_countries = resTop10Countries;

    obj.top10_destinations = resTop10Dest;

    const accountArray = [];
    for(let topAccount of resTop10Account) {
        const account = await Account.findOne({_id: topAccount._id}).exec();
        accountArray.push({
            _id: topAccount._id,
            name: account.account_name,
            count: topAccount.count
        });
    }
    obj.top10_accounts = accountArray;

    obj.transCount_by_currency = resTrans;
    if(obj.top10_accounts.length == 0 || obj.top10_countries.length == 0) {
        return
    }

    const objArray = [];
    for(let i = steps; i > 0; i --) {
        const timeSpan = statTimer.timeSpanInStep(i);
        const start_mo = timeSpan.start;
        const end_mo = timeSpan.end;

        const top10CountriesTopup = [];
        const top10CountriesPaid = [];
        const top10AccountsTopup = [];
        const top10AccountsPaid = [];

        const top10CountriesTopupPromises = [];
        const top10CountriesPaidPromises = [];

        for(let countryEntry of resTop10Countries) {
            top10CountriesTopupPromises.push(new Promise(async (resolve, reject) => {
                try {
                    const resCountriesTopup = await StatHelperCore.getTopupGroupCTCOT(agentAccountIDArr, countryEntry._id, start_mo, end_mo);
                    resCountriesTopup.forEach(entry => {
                        top10CountriesTopup.push({
                            _id: entry._id.country,
                            country: entry._id.country,
                            count: entry.count,
                            currency: entry._id.currency,
                            amount: entry.amount,
                            code: entry._id.code,
                            operator_name: entry._id.operator_name,
                            tag: entry._id.tag,
                            type: entry._id.type
                        });
                    })
                    resolve();
                } catch(e) {
                    reject(e);
                }
                
            }));
            
            top10CountriesPaidPromises.push(new Promise(async (resolve, reject) => {
                try {
                    const resCountriesPaid = await StatHelperCore.getTopupGroupCPCOT(agentAccountIDArr, countryEntry._id, start_mo, end_mo);
                    resCountriesPaid.forEach(entry => {
                        top10CountriesPaid.push({
                            _id: entry._id.country,
                            country: entry._id.country,
                            count: entry.count,
                            currency: entry._id.currency,
                            amount: entry.amount,
                            code: entry._id.code,
                            operator_name: entry._id.operator_name,
                            tag: entry._id.tag,
                            type: entry._id.type
                        })
                    })
                    resolve();
                } catch(e) {
                    reject(e);
                }
                
            }));
        }

        const top10AccountsTopupPromises = [];
        const top10AccountsPaidPromises = [];
        
        for(let account of obj.top10_accounts) {
            const objId = account._id;
            const accObj = await Account.findOne({_id: objId}).exec();
            const parentAccObj = await Account.findOne({_id: accObj.parent}).exec();

            top10AccountsTopupPromises.push(new Promise(async (resolve, reject) => {
                try{
                    const resAccountsTopup = await StatHelperCore.getTopupGroupATCCOT(account._id, start_mo, end_mo);
                    resAccountsTopup.forEach(entry => {
                        top10AccountsTopup.push({
                            _id: entry._id.account,
                            account_name: accObj.account_name,
                            count: entry.count,
                            currency: entry._id.currency,
                            amount: entry.amount,
                            code: entry._id.code,
                            country: entry._id.country,
                            operator_name: entry._id.operator_name,
                            parentid: parentAccObj._id,
                            parentname: parentAccObj.account_name,
                            tag: entry._id.tag,
                            type: entry._id.type
                        })
                    })
                    resolve();
                } catch(e) {
                    reject(e);
                }
            }))
            
            top10AccountsPaidPromises.push(new Promise(async (resolve, reject) => {
                try{
                    const resAccountsPaid = await StatHelperCore.getTopupGroupAPCCOT(account._id, start_mo, end_mo);
                    resAccountsPaid.forEach(entry => {
                        top10AccountsPaid.push({
                            _id: entry._id.account,
                            account_name: accObj.account_name,
                            count: entry.count,
                            currency: entry._id.currency,
                            amount: entry.amount,
                            code: entry._id.code,
                            country: entry._id.country,
                            operator_name: entry._id.operator_name,
                            parentid: parentAccObj._id,
                            parentname: parentAccObj.account_name,
                            tag: entry._id.tag,
                            type: entry._id.type
                        });
                    });
                    resolve();
                } catch(e) {
                    reject(e);
                }
            }));
        }

        const [successful, fail, webChannel, apiChannel, pinpChannel, ivrChannel] = await Promise.all([
            StatHelperCore.getTopupCountBySuccessStat(agentAccountIDArr, start_mo, end_mo, true),
            StatHelperCore.getTopupCountBySuccessStat(agentAccountIDArr, start_mo, end_mo, false),
            StatHelperCore.getTopupCountByChannel(agentAccountIDArr, start_mo, end_mo, 'web'),
            StatHelperCore.getTopupCountByChannel(agentAccountIDArr, start_mo, end_mo, 'api'),
            StatHelperCore.getTopupCountByChannel(agentAccountIDArr, start_mo, end_mo, 'pinp'),
            StatHelperCore.getTopupCountByChannel(agentAccountIDArr, start_mo, end_mo, 'ivr'),
            Promise.all(top10AccountsTopupPromises),
            Promise.all(top10AccountsPaidPromises),
            Promise.all(top10CountriesTopupPromises),
            Promise.all(top10CountriesPaidPromises)
        ])
        
        const stats = {
            suxx_vs_fail: {
                successful: successful,
                failed: fail
            },
            topups_by_channel: {
                web: webChannel,
                api: apiChannel,
                pinp: pinpChannel,
                ivr: ivrChannel
            },
            top10_countries_topup: top10CountriesTopup,
            top10_accounts_topup: top10AccountsTopup,
            top10_accounts_paid: top10AccountsPaid,
            top10_countries_paid: top10CountriesPaid,
            time: dateFormatter.format(start_mo),
            ts: start_mo
        }
        objArray.push(stats);
    }
    obj.stats = objArray;
    currentTime = new Date();
    obj.time =  end;
    await saveModel.create(obj);
}
