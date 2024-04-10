require('dotenv').config({path: './../.env'});
const ProvMapping = require('../models/provmapping');
const Operator = require('../models/operator');

async function run() {
    const mappings = await ProvMapping.find().exec();
    for(let mapping of mappings) {
        const operator = await Operator.findOne({country: {$regex: new RegExp(country), $options: 'i'}}).exec();
        if(operator) {
            await ProvMapping.update({
                _id: mapping._id
            }, {
                $set: {
                    iso: operator.iso
                }
            }).exec();
        }
    }
    process.exit(1);
}

run();