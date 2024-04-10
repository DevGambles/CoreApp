require('dotenv').config({path: './../.env'});
const Prefix = require('../models/prefix');
const ProvHelper = require('../models/provhelper');

async function run() {
    const isos = await Prefix.find().distinct('iso').exec();
    for(let line of isos) {
        const operators = await Prefix.find({iso: line}).distinct('operatorName').exec();
        for(let operator of operators) {
            const prefix = await Prefix.findOne({
                iso: line,
                operatorName: operator
            }).exec();
            console.log(prefix.iso, prefix.operatorName, prefix.operatorId);
            const rec = {
                iso: prefix.iso.toLowerCase(),
                country: prefix.country,
                operator_name: prefix.operatorName,
                operator_id: prefix.operatorId,
                code: prefix.iso + ':' + prefix.operatorId
            };

            await ProvHelper.create(rec);
        }
    }

    process.exit(1);
}

run();