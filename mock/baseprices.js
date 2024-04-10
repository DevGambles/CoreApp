require('dotenv').config({path: './../.env'});
const Operator = require('../models/operator');
const BaseProd = require('../models/baseprod');
const UKBlPrice = require('../models/ukblprice');
const ProvMapping = require('../models/provmapping');
const Rate = require('../models/rate');
const TRTLPrice = require('../models/trtlprice');
const Prefix = require('../models/prefix');
const TransferToPrice = require('../models/transfertoprice');
const TriangloPrice = require('../models/triangloprice');
const CountryHelper = require('../models/countryhelper');

const CountryProductProcessor = {
    "United Kingdom": async function (country) {
        let prices = await UKBlPrice.find({}).exec();
        for(let price of prices) {
            const map = await ProvMapping.findOne({trt_id: price.operator_id}).exec();
            const rate = await Rate.findOne({source: 'USD', destination: 'GBP'}).exec();
            const exPrice = (parseFloat(price.unit_cost) / parseFloat(rate.rate)).toFixed(2);
            const prod = {
                apid: 'UKBL',
                iso: 'UK',
                acloperId: map.trl_id,
                sku: 'UKBL-' + price.operator_id + '-' + price.denomination,
                name: price.operator_name,
                operator_id: price.operator_id,
                min_denomination: price.denomination,
                max_denomination: price.denomination,
                topup_currency: price.currency,
                price: parseFloat(price.unit_cost),
                step: 0,
                fx_rate: '-',
                currency: 'GBP',
                active: true,
                country: country
            }
            await BaseProd.create(prod);
        }
    },
    'Kenya': async function (country) {
        let prices = await TRTLPrice.find({currency: 'KES'}).exec();
        for(let price of prices) {
            const map = await ProvMapping.findOne({
                country: {$regex: new RegExp(country), $options: 'i'},
                active: true
            }).exec();
            const rate = await Rate.findOne({
                source: 'USD',
                destination: 'KES'
            }).exec();
            const exPrice = (parseFloat(price.min_denomination) / parseFloat(rate.rate)).toFixed(2);
            const prod = {
                apid: 'TRTL',
                iso: 'KE',
                acloperId: price.skuid,
                name: price.operator_name,
                operator_id: price.operator_id,
                min_denomination: price.min_denomination,
                max_denomination: price.max_denomination,
                topup_currency: price.currency,
                currency: price.currency,
                active: true,
                country: country
            };

            if(price.min_denomination == price.max_denomination) {
                prod.sku = 'TRTL-' + price.operator_id + '-' + price.min_denomination;
                prod.price = exPrice;
                prod.step = 0;
                prod.fx_rate = '-';
            } else {
                prod.sku = 'TRTL-' + price.operator_id + '-OR';
                prod.price = '-';
                prod.step = 1;
                prod.fx_rate = 1;
            }
            await BaseProd.create(prod);
        }
    },
    'South Africa': async function (country) {
        let prices = await TRTLPrice.find({currency: 'ZAR'}).exec();
        for(let price of prices) {
            const map = await ProvMapping.findOne({country: {$regex: new RegExp(country), $options: 'i'}, active: true}).exec();
            const rate = await Rate.findOne({source: 'USD', destination: 'ZAR'}).exec();
            const exPrice = (parseFloat(price.min_denomination) / parseFloat(rate.rate)).toFixed(2);
            const prod = {
                apid: 'TRTL',
                iso: 'ZA',
                acloperId: map.trl_id,
                skuid: price.skuid,
                name: price.operator_name,
                operator_id: price.operator_id,
                min_denomination: price.min_denomination,
                max_denomination: price.max_denomination,
                topup_currency: price.currency,
                currency: price.currency,
                active: true,
                country: country
            };

            if(price.min_denomination == price.max_denomination) {
                prod.sku = 'TRTL-' + price.operator_id + '-' + price.min_denomination;
                prod.price = exPrice;
                prod.step = 0;
                prod.fx_rate = '-';
            } else {
                prod.sku = 'TRTL-' + price.operator_id + '-OR';
                prod.price = '-';
                prod.step = 1;
                prod.fx_rate = 1;
            }
            await BaseProd.create(prod);
        }
    },
    'Benin': async function (country) {
        let prices = await TRTLPrice.find(
            {country: {$regex: new RegExp(country), $options: 'i'}, active: true}
        ).exec();

        for(let price of prices) {
            const map = ProvMapping.findOne({trt_id: price.operator_id}).exec();
            const rate = Rate.findOne({source: 'USD', destination: 'XOF'}).exec();
            const price = (parseFloat(price.min_denomination) / parseFloat(rate.rate)).toFixed(2);
            const prod = {
                apid: 'TRTL',
                iso: 'BJ',
                acloperId: map.trl_id,
                skuid: price.skuid,
                name: price.operator_name,
                operator_id: price.operator_id,
                min_denomination: price.min_denomination,
                max_denomination: price.max_denomination,
                topup_currency: price.currency,
                currency: price.currency,
                active: true,
                country: country
            };

            if(price.min_denomination == price.max_denomination) {
                prod.sku = 'TRTL-' + price.operator_id + '-' + price.min_denomination;
                prod.price = parseFloat(price.min_denomination);
                prod.step = 0;
                prod.fx_rate = '-';
            } else {
                prod.sku = 'TRTL-' + price.operator_id + '-OR';
                prod.price = '-';
                prod.step = 1;
                prod.fx_rate = 1;
            }
            await BaseProd.create(prod);
        }
    },
    'Tanzania': function (country) {        
        let prices = await TRTLPrice.find(
            {country: {$regex: new RegExp(country), $options: 'i'}, active: true}
        ).exec();

        for(let price of prices) {
            const map = ProvMapping.findOne({trt_id: price.operator_id}).exec();
            const rate = Rate.findOne({source: 'USD', destination: 'TZS'}).exec();
            const exPrice = (parseFloat(price.min_denomination) / parseFloat(rate.rate)).toFixed(2);
            const prod = {
                apid: 'TRTL',
                iso: 'TZ',
                acloperId: map.trl_id,
                skuid: price.skuid,
                name: price.operator_name,
                operator_id: price.operator_id,
                min_denomination: price.min_denomination,
                max_denomination: price.max_denomination,
                topup_currency: price.currency,
                currency: price.currency,
                active: true,
                country: country
            }
            if(price.min_denomination == price.max_denomination) {
                prod.sku = 'TRTL-' + price.operator_id + '-' + price.min_denomination;
                prod.price = parseFloat(price.min_denomination);
                prod.step = 0;
                prod.fx_rate = '-';
            } else {
                prod.sku = 'TRTL-' + price.operator_id + '-OR';
                prod.price = '-';
                prod.step = 1;
                prod.fx_rate = 1;
            }

            await BaseProd.create(prod);
        }
    },
    'Uganda': function (country) {
        let prices = await TRTLPrice.find(
            {country: {$regex: new RegExp(country), $options: 'i'}, active: true}
        ).exec();

        for(let price of prices) {
            const map = await ProvMapping.findOne({trt_id: price.operator_id}).exec();
            const rate = await Rate.findOne({source: 'USD', destination: 'UGX'}).exec();
            const exPrice = (parseFloat(price.min_denomination) / parseFloat(rate.rate)).toFixed(2);
            const prod = {
                apid: 'TRTL',
                iso: 'UG',
                acloperId: map.trl_id,
                skuid: price.skuid,
                name: price.operator_name,
                operator_id: price.operator_id,
                min_denomination: price.min_denomination,
                max_denomination: price.max_denomination,
                topup_currency: price.currency,
                currency: price.currency,
                active: true,
                country: country
            };

            if(price.min_denomination == price.max_denomination) {
                prod.sku = 'TRTL-' + price.operator_id + '-' + price.min_denomination;
                prod.price = exPrice;
                prod.step = 0;
                prod.fx_rate = '-';
            } else {
                prod.sku = 'TRTL-' + price.operator_id + '-OR';
                prod.price = '-';
                prod.step = 1;
                prod.fx_rate = 1;
            }
            await BaseProd.create(prod);
        }
    },
    '__bgn__': async function (country, currency, apid) {
        const rate = await Rate.findOne({source: 'USD', destination: currency}).exec();
        const operators = await Prefix.distinct('operatorId', {country: country}).exec();
        
        for(let operator of operators) {
            const prefix = await Prefix.findOne({country: country, operatorId: operator}).exec();
            const prod = {
                apid: apid,
                iso: prefix.iso.toUpperCase(),
                acloperId: prefix.operatorId,
                sku: apid + '-' + prefix.operatorId + '-OR',
                name: prefix.operatorName,
                operator_id: prefix.operatorId,
                min_denomination: prefix.openRangeMin,
                max_denomination: prefix.openRangeMax,
                topup_currency: currency,
                step: 1,
                country: country,
                fx_rate: rate.rate,
                price: '-',
                currency: 'USD',
                active: true
            };

            BaseProd.create(prod);
            
        }
    },
    'Bangladesh': async function (country) {
        await this.__bgn__(country, 'BDT', 'SSLW');
    },
    'Ghana': async function (country) {
        await this.__bgn__(country, 'GHS', 'ETRX');
    },
    'Nigeria': async function (country) {
        await this.__bgn__(country, 'NGN', 'MFIN');
    },
    'default': async function (country) {
        const exceptions = ['Niger', 'Netherlands', 'Congo', 'Dominica'];
        let trt, trl, trl2;

        if(exceptions.indexOf(country) != -1) {
            trt = await TransferToPrice.find({
                country: country, active: true
            }).exec();
            // trl = await TransferToPrice.count({
            //     country: country, active: true
            // }).exec();
            // trl2 = await TriangloPrice.count({
            //     country: country, active: true
            // }).exec();
        } else {
            trt = await TransferToPrice.find({
                country: {$regex: new RegExp(country), $options: 'i'}, active: true
            }).exec();
            // trl = await TransferToPrice.count({
            //     country: {$regex: new RegExp(country), $options: 'i'}, active: true
            // }).exec();
            // trl2 = await TriangloPrice.count({
            //     country: {$regex: new RegExp(country), $options: 'i'}, active: true
            // }).exec();

            $convert = false;
            for(let price of trt) {
                const map = await ProvMapping.findOne({trt_id: price.operator_id}).exec();

                let prod;
                if(map !== null) {
                    prod = {
                        apid: 'TRTO',
                        iso: map.iso.toUpperCase(),
                        acloperId: map.trl_id.toUpperCase(),
                        sku: 'TRTO-' + price.operator_id + '-' + price.denomination,
                        name: price.operator_name,
                        operator_id: price.operator_id,
                        min_denomination: price.denomination,
                        max_denomination: price.denomination,
                        topup_currency: price.currency,
                        price: parseFloat(price.unit_cost.toFixed(2)),
                        step: 0,
                        fx_rate: '-',
                        currency: 'USD',
                        active: true,
                        country: price.country
                    }
                } else {
                    const chelp = await CountryHelper.findOne({country: {$regex: new RegExp(country), $options: 'i'}}).exec();
                    prod = {
                        apid: 'TRTO',
                        sku: 'TRTO-' + price.operator_id + '-' + price.denomination,
                        name: price.operator_name,
                        operator_id: price.operator_id,
                        min_denomination: price.denomination,
                        max_denomination: price.denomination,
                        topup_currency: price.currency,
                        price: parseFloat(price.unit_cost.toFixed(2)),
                        step: 0,
                        fx_rate: '-',
                        currency: 'USD',
                        active: true,
                        country: price.country
                    }
                    if(chelp !== null) {
                        prod.iso = chelp.iso.toUpperCase();
                        prod.acloperId = 'ALL';
                    } else {
                        prod.iso = null;
                        prod.acloperId = null;
                    }
                }
                await BaseProd.create(prod);
            }
        }
    }
};

async function run() {
    let countries = await Operator.find({}).distinct('country').exec();
    for(let country of countries) {
        await BaseProd.deleteMany({'country': country}).exec();
        if(Object.keys(CountryProductProcessor).indexOf(country) != -1) {
            await CountryProductProcessor[country].call(CountryProductProcessor, country);
        } else {
            await CountryProductProcessor.default.call(CountryProductProcessor, country);
        }
    }
    process.exit(1);
}

run();