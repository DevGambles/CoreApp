require('dotenv').config({path: './../.env'});
const TransferToPrice = require('../models/transfertoprice');
const TriangloPrice = require('../models/triangloprice');
const ProvMapping = require('../models/provmapping');

async function run() {
    const operators = await TransferToPrice.find().distinct('operator_id').exec();
    
    for(let operator of operators) {
        const price = await TransferToPrice.findOne({operator_id: operator}).exec();
        const oper = price.country.replace(price.operator_name, '');
        const mr = {
            $regex: new RegExp(oper.trim()),
            $options: 'i'
        };
        const tr = await TriangloPrice.findOne({
            country: price.country.trim(),
            operator_name: mr
        }).exec();

        if(tr) {
            const rec = {
                country: price.country,
                operator_name: oper,
                trt_id: price.operator_id,
                trl_id: tr.operator_id
            };
            await ProvMapping.create(rec);
        } else {
            console.log(price.country, ',', oper, price.operator_id);
        }
    }

    process.exit(1);
}

run();