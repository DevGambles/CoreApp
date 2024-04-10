require('dotenv').config({path: './../.env'});
const Account = require('../models/account');

async function run() {
    const me = await Account.findOne({
        _id: "5842ec6ab8c649bd5397188f"
    }).exec();
    
    const parents = await Account.find({parent: me.id}).exec();
    
    const accounts = [];
    const agentAccounts = [];
    
    for(let parent of parents) {
        accounts.push(parent._id);
        if(parent.type == 'agent') {
            agentAccounts.push(parent._id);
        }
    
        pParents = await Account.find({parent: parent._id}).exec();
        pParents.forEach(pParent => {
            accounts.push(pParent._id);
            if(pParent.type == 'agent') {
                agentAccounts.push(pParent._id);
            }
        });
    }
    console.log(accounts);
    console.log('+======AGENTS=====');
    console.log(agentAccounts);
    process.exit(1);
}

run();