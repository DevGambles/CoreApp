require('dotenv').config({path: './../.env'});
const Account = require('../models/account');
const Product = require('../models/product');
const Operator = require('../models/operator');
const Rate = require('../models/rate');
const Prefix = require('../models/prefix');
const TransferToPrice = require('../models/transfertoprice');
const TriangloPrice = require('../models/triangloprice');

async function run() {
    const accounts = await Account.find().exec();
    for(let account of accounts) {
        console.log('PROCESSING :', account.account_name, ' Account Type : ', account.type);

        await Product.remove({
            account: account._id
        }).exec();
        if(account.type == 'reseller') {
            const parentAccount = await Account.findOne({
                _id: account.parent
            }).exec();
            re = {
                profit_pct: parentAccount.profit_pct
            };
            wh = (parseFloat(account.profit_pct) + 100) / 100;
        } else if(account.type == 'agent') {
            const parentAccount = await Account.findOne({
                _id: account.parent
            }).exec();

            if(parentAccount.type == 'reseller') {
                wh = await Account.findOne({_id: parentAccount.parent}).exec();
                re = parentAccount;
            }  else if(parentAccount.type == 'wholesaler') {
                wh = pa;
                re = {
                    profit_pct: 0
                }
            } else {
                return;
            }
        } else if(account.type == 'wholesaler') {
            wh = {profit_pct: 0};
            re = {profit_pct: 0}
        } else {
            return;
        }

        const countries = await Operator.find().distinct('country').exec();
        for(let line of countries) {
            let obj;

            if(['Bangladesh', 'Ghana', 'Nigeria'].indexOf(line) != -1) {
                let currency, apid;
                switch(line) {
                    case 'Bangladesh':
                        currency = 'BDT';
                        apid = 'SSLW-ALL-OR';
                        break;
                    case 'Ghana':
                        currency = "GHS";
                        apid = "ETRX-ALL-OR"
                        break;
                    case 'Nigeria':
                        currency = "NGN";
                        apid = "MFIN-ALL-OR";
                        break;
                    default:
                        return;
                }
                const rate = await Rate.findOne({
                    source: account.currency,
                    destination: currency
                }).exec();
                const opr = await Prefix.findOne({
                    country: line
                }).exec();
                const finrate = parseFloat(rate.rate) - parseFloat(rate.rate) * parseFloat(account.profit_pct) / 100 - parseFloat(rate.rate) * parseFloat(wh.profit_pct) / 100 - parseFloat(rate.rate) * parseFloat(re.profit_pct) / 100;
                obj = {
                    sku: apid,
                    account: account._id,
                    name: 'ALL',
                    operator_id: 'ALL',
                    min_denomination: opr.openRangeMin,
                    max_denomination: opr.oepnRangeMax,
                    topup_currency: currency,
                    step: '1',
                    country: line,
                    fx_rate: Math.round(finrate * 100) / 100,
                    price: '-',
                    currency: account.currency,
                    active: true
                }
                await Product.create(o);
            } else {
                let convert, fxr;
                const trt = await TransferToPrice.find({
                    country: line,
                    active: true
                }).exec();
                const trl = await TransferToPrice.count({
                    country: line,
                    active: true
                }).exec();
                const trl2 = await TriangloPrice.count({
                    country: line,
                    active: true
                }).exec();
                if(account.currency !== 'USD') {
                    convert = true;
                    const fx = await Rate.findOne({source: account.currency, destination: 'USD'}).exec();
                    fxr = fx.rate;
                } else {
                    convert = false;
                }
                console.log('TRT Count :', trl);
                console.log('TRL Count :', trl2);

                for(let l of trt) {
                    const oper = line.replace(l.operator_name, '');
                    const mr = {
                        $regex: new RegExp(oper.trim()),
                        $options: 'i'
                    }
                    const trCount = await TriangloPrice.count({
                        country: line,
                        operator_name: mr
                    }).exec();
                    if(trCount > 0) {
                        if(trCount == 1) {
                            const tr2 = await TriangloPrice.findOne({
                                country: line,
                                operator_name: mr
                            }).exec();

                            if((parseInt(l.denomination) > parseInt(tr2.min_denomination)) && (parseInt(l.denomination) < parseInt(tr2.max_denomination))) {
                                const tprice = parseInt(l.denomination) / parseFloat(tr2.rate);
                                if(parseFloat(l.unit_cost) > parseFloat(tprice)) {
                                    obj = {
                                        sku: 'TRLO-' + tr2.operator_id + '-' + l.denomination,
                                        account: account._id,
                                        name: l.operator_name,
                                        operator_id: tr2.operator_id,
                                        min_denomination: l.denomination,
                                        max_denomination: l.denomination,
                                        topup_currency: l.currency,
                                        price: Math.round(tprice * 100) / 100,
                                        step: '-',
                                        fx_rate: '-',
                                        currency: account.currency,
                                        active: true,
                                        country: l.country
                                    }
                                } else {
                                    obj = {
                                        sku: 'TRTO-' + l.operator_id + '-' + l.denomination,
                                        account: account._id,
                                        name: l.operator_name,
                                        operator_id: l.operator_id,
                                        min_denomination: l.denomination,
                                        max_denomination: l.denomination,
                                        topup_currency: l.currency,
                                        price: Math.round(l.unit_cost * 100) / 100,
                                        step: '-',
                                        fx_rate: '-',
                                        currency: account.currency,
                                        active: true,
                                        country: l.country
                                    }
                                }
                            } else {
                                obj = {
                                    sku: 'TRTO-' + l.operator_id + '-' + l.denomination,
                                    account: account._id,
                                    name: l.operator_name,
                                    operator_id: l.operator_id,
                                    min_denomination: l.denomination,
                                    max_denomination: l.denomination,
                                    topup_currency: l.currency,
                                    price: Math.round(l.unit_cost * 100) / 100,
                                    step: '-',
                                    fx_rate: '-',
                                    currency: account.currency,
                                    active: true,
                                    coutry: l.country
                                }
                            }
                        } else {
                            const tr2 = await TriangloPrice.findOne({country: line, operator_name: mr, min_denomination: l.denomination}).exec();
                            if(tr2 !== null) {
                                if(parseFloat(l.unit_cost) > parseFloat(tr2.unit_cost)) {
                                    obj = {
                                        sku: 'TRLO-' + tr2.operator_id + '-' + l.denomination,
                                        account: account._id,
                                        name: l.operator_name,
                                        operator_id: tr2.operator_id,
                                        min_denomination: l.denomination,
                                        max_denomination: l.denomination,
                                        topup_currency: l.currency,
                                        price: Math.round(parseFloat(tr2.unit_cost) * 100) / 100,
                                        step: '-',
                                        fx_rate: '-',
                                        currency: account.currency,
                                        active: true,
                                        country: l.country
                                    }
                                } else {
                                    obj = {
                                        sku: 'TRTO-' + l.operator_id + '-' + l.denomination,
                                        account: account._id,
                                        name: l.operator_name,
                                        operator_id: l.operator_id,
                                        min_denomination: l.denomination,
                                        max_denomination: l.denomination,
                                        topup_currency: l.currency,
                                        price: Math.round(l.unit_cost * 100) / 100,
                                        step: '-',
                                        fx_rate: '-',
                                        currency: account.currency,
                                        active: true,
                                        country: l.country
                                    }
                                }
                            } else {
                                obj = {
                                    sku: 'TRTO-' + l.operator_id + '-' + l.denomination,
                                    account: account._id,
                                    name: l.operator_name,
                                    operator_id: l.operator_id,
                                    min_denomination: l.denomination,
                                    max_denomination: l.denomination,
                                    topup_currency: l.currency,
                                    price: Math.round(l.unit_cost * 100) / 100,
                                    step: '-',
                                    fx_rate: '-',
                                    currency: account.currency,
                                    active: true,
                                    country: l.country
                                }
                            }
                        }
                    } else {
                        obj = {
                            sku: 'TRTO-' + l.operator_id + '-' + l.denomination,
                            account: account._id,
                            name: l.operator_name,
                            operator_id: l.operator_id,
                            min_denomination: l.denomination,
                            max_denomination: l.denomination,
                            topup_currency: l.currency,
                            price: Math.round(l.unit_cost * 100) / 100,
                            step: '-',
                            fx_rate: '-',
                            currency: account.currency,
                            active: true,
                            country: l.country
                        }
                    }
                    const p1 = (parseFloat(wh.profit_pct) + 100) / 100;
                    const p2 = (parseFloat(re.profit_pct) + 100) / 100;
                    const p3 = (parseFloat(account.profit_pct) + 100) / 100;
                    obj.price = parseFloat(obj.price) * p1 * p2 * p3;
                    obj.price = Math.round(obj.price * 100) / 100;

                    if(convert) {
                        obj.price = Math.round(parseFloat(obj.price) / parseFloat(fxr) * 100) / 100;
                    }

                    await Product.create(obj);
                }
                const trtPrices = await TriangloPrice.find({
                    country: line,
                    unit_cost: '-'
                }).exec();
                for(let vv of trtPrices) {
                    obj = {
                        sku: 'TRLO-' + vv.operator_id + '-OR',
                        account: account._id,
                        name: vv.operator_name,
                        operator_id: vv.operator_id,
                        min_denomination: vv.min_denomination,
                        max_denomination: vv.max_denomination,
                        topup_currency: vv.currency,
                        price: '-',
                        step: '-',
                        fx_rate: Math.round(vv.rate * 100) / 100,
                        currency: account.currency,
                        active: true,
                        country: vv.country
                    };
                    obj.fx_rate = parseFloat(vv.rate) - (parseFloat(vv.rate) * parseFloat(account.profit_pct) / 100) - (parseFloat(vv.rate) * parseFloat(wh.profit_pct) / 100) - (parseFloat(vv.rate) * parseFloat(re.profit_pct) / 100);
                    obj.fx_rate = Math.round(obj.fx_rate * 100) / 100;

                    if(convert) {
                        obj.fx_rate = Math.round(parseFloat(obj.fx_rate) * parseFloat(fxr) * 100) / 100;
                    }

                    await Product.create(o);
                }
            }
        }
    }

    process.exit(1);
}

run();