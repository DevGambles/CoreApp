require('dotenv').config({path: './../.env'});
const Account = require('../models/account');
const StatHelperAgent = require('./stat_helper_agent');
const YearlyStat = require('../models/yearlystat');

async function run () {
    const accounts = await Account.find({
        type: {
            $nin: ['agent', 'system']
        }
    }).exec();

    for(let b of accounts) {
        if(b._id == '5842ec6ab8c649bd5397188f') {
            const s1 = await Account.find({parent: b._id}).exec();
            const accountIDs = [];
            const agentAccountIDs = [];
            for(let s of s1) {
                accountIDs.push(s._id);
                if(s.type == 'agent') {
                    agentAccountIDs.push(s._id);
                }
                const ss = await Account.find({parent: s._id}).exec();
                ss.forEach(as => {
                    accountIDs.push(as._id);
                    if(as.type == 'agent') {
                        agentAccountIDs.push(as._id);
                    }
                })
            }

            console.log('Account : ', b.account_name, ' Was Created On : ', b.createdAt);
            accountIDs.push(b._id);
            const accstat = [];
            const dayStart = new Date(b.createdAt.getFullYear(), b.createdAt.getMonth(), b.createdAt.getDate());
            const start_of_mo = new Date((new Date()).getTime() - 86400000 * 365);
            const dayEnd = new Date(b.createdAt.getFullYear(), b.createdAt.getMonth(), b.createdAt.getDate(), 23, 59, 59);
            const txperday = [];
            const topperday = [];

            const dstats = [];
            const resAgent = await StatHelperAgent.getTopupGroupAP(agentAccountIDs, start_of_mo, new Date());
            
            const topAgentArray = [];

            const objAgent = resAgent;
            objAgent.forEach(obj => {
                if(topAgentArray.indexOf(obj._id.account) == -1) {
                    topAgentArray.push(obj._id.account);
                }
            })

            const currentTime = new Date();
            for(let i = 12; i > 0; i --) {
                const dresu = {};
                const start = new Date(currentTime.getTime() - (86400000 * 30) * i);
                const end = new Date(start.getTime() + 86400000 * 30);
                const resAgentArray = [];
                for(let agent of topAgentArray) {
                    const item = await Account.findOne({_id: agent}).exec();
                    const resAgent1 = await StatHelperAgent.getTopupPaidACGroupAP(agent, start, end);
                    if(resAgent1.length == 1) {
                        resAgentArray.push({
                            _id: resAgent1[0]._id,
                            account_name: item.account_name,
                            paid_amount: resAgent1[0].paid_amount,
                            paid_count: resAgent1[0].paid_count
                        })
                    }
                }

                dresu.top_agent = resAgentArray;
                dstats.push(dresu);
            }
            const ins = {
                stats: dstats
            }
            await YearlyStat.create(ins);
        }
    }

    process.exit(1);
}

run();