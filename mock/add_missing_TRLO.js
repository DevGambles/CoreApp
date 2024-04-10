require('dotenv').config({path: './../.env'});
const TriangloPrice = require('../models/triangloprice');
const CountryHelpers = require('../models/countryhelper');
const BaseProds = require('../models/baseprod');
const ProvMappings = require('../models/provmapping');

const myArgs = process.argv.slice(2);
const country = myArgs[0];

async function run() {
    const helper = await CountryHelpers.findOne({country}).exec();
    helper = helper || {
        iso: ''        
    }

    let result = await TriangloPrice.find({country}).exec();

    for(let price of result) {
        const provMap = await ProvMappings.findOne({'trl_id': price.operator_id}).exec();
        provMap = provMap || {};

        var product = {
            'apid' : 'TRLO',
            'iso': helper['iso'].toUpperCase(),
            'acloperId': price.operator_id,
            'sku': 'TRLO-' + price.operator_id + '-' + price.min_denomination,
            'name': provMap.operator_name,
            'operator_id': price.operator_id,
            'min_denomination': price.min_denomination,
            'max_denomination': price.max_denomination,
            'topup_currency': price.currency,
            'price': price.unit_cost.toFixed(2),
            'step': parseFloat(price.step),
            'fx_rate': '-',
            'currency': 'USD',
            'active': true,
            'country': country
        };
        await BaseProds.create(product);
    }
    process.exit(1);
}
run();