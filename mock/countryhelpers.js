require('dotenv').config({path: './../.env'});
const ProvMapping = require('../models/provmapping');
const CountryHelper = require('../models/countryhelper');
const ProvHelper = require('../models/provhelper');

async function run() {
    const countries = await ProvMapping.find().distinct('country').exec();

    for(let country of countries) {
        const mapping = await ProvMapping.findOne({country: country}).exec();
        const arr = {
            iso: mapping.iso,
            country: country,
            code: mapping.iso.toUpperCase() + ':ALL'
        };
        await CountryHelper.create(arr);
    }

    const isos = await CountryHelper.find().distinct('iso').exec();
    for(let iso of isos) {
        const mappings = await ProvMapping.find({iso: iso}).exec();
        for(let mapping of mappings) {
            const arr = {
                iso: iso,
                country: mapping.country,
                operator_name: mapping.operator_name,
                operator_id: mapping.trl_id,
                code: iso.toUpperCase() + ':' + mapping.trl_id
            }
            await ProvHelper.create(arr);
        }
    }

    await ProvHelper.deleteMany({
        iso: {$in: ['bd', 'ng', 'gh']}
    }).exec();
    process.exit(1);
}

run();
