require('dotenv').config({path: './../.env'});
const TransferToPrice = require('../models/transfertoprice');
const TriangloPrice = require('../models/triangloprice');
const Account = require('../models/account');

async function run() {
    
    const country = "Malaysia";
    const trt = await TransferToPrice.find({
        country: country
    }).exec();

    let obj;

    for(let l of trt) {
        const oper = l.operator_name.replace(country, '');
        console.log('OPER IS : ', oper);

        const mr = {$regex: new RegExp(oper.trim()), $options: 'i'}
        console.log(mr);
        const tr = await TriangloPrice.count({
            country: country,
            operator_name: mr
        }).exec();
        console.log('COUNT IS : ', tr);
        console.log(l.operator_name);
    
        if(tr > 0) {
            // Check Tranglo
            if(tr == 1) {
                //Open Range
                const tr2 = await TriangloPrice.findOne({
                    country: country,
                    operator_name: mr
                }).exec()

                if((parseInt(l.denomination) > parseInt(tr2.min_denomination)) && (parseInt(l.denomination) < parseInt(tr2.max_denomination))) {
                    const tprice = parseInt(l.denomination) * parseFloat(tr2.rate);
                    if(parseFloat(l.unit_cost) > parseFloat(tprice)) {
                        obj = {
                            sku: 'TRLO-' + tr2.operator_id + '-' + l.denomination,
                            account: account._id,
                            name: tr2.operator_name,
                            operator_id: tr2.operator_id,
                            min_denomination: l.denomination,
                            max_denomination: l.denomination,
                            topup_currency: l.currency,
                            price: tprice,
                            step: '-',
                            fx_rate: '-',
                            currency: 'USD',
                            active: true,
                            country: l.country
                        }            
                    } else {
                        //trto it is
                        obj = {
                            sku: 'TRTO-' + l.operator_id + '-' + l.denomination,
                            account: account._id,
                            name: l.operator_name,
                            operator_id: l.operator_id,
                            min_denomination: l.denomination,
                            max_denomination: l.denomination,
                            topup_currency: l.currency,
                            price: l.unit_cost,
                            step: '-',
                            fx_rate: '-',
                            currency: 'USD',
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
                            price: l.unit_cost,
                            step: '-',
                            fx_rate: '-',
                            currency: 'USD',
                            active: true,
                            country: l.country
                    }
                }
            } else {
                //Fixed
                const tr2 = await TriangloPrice.findOne({
                    country: country,
                    operator_name: mr,
                    min_denomination: l.denomination
                }).exec()

                if(tr2 !== null) {
                    //we have match
                    if(parseFloat(l.unit_cost) > parseFloat(tr2.unit_cost)) {
                        //trlo
                        obj = {
                            sku: 'TRLO-' + tr2.operator_id + '-' + l.denomination,
                            account: account._id,
                            name: tr2.operator_name,
                            operator_id: tr2.operator_id,
                            min_denomination: l.denomination,
                            max_denomination: l.denomination,
                            topup_currency: l.currency,
                            price: parseFloat(tr2.unit_cost),
                            step: '-',
                            fx_rate: '-',
                            currency: 'USD',
                            active: true,
                            country: l.country
                        }
                    } else {
                        //trto
                        //fallback to TRTO
                        obj = {
                            sku: 'TRTO-' + l.operator_id + '-' + l.denomination,
                            account: account._id,
                            name: l.operator_name,
                            operator_id: l.operator_id,
                            min_denomination: l.denomination,
                            max_denomination: l.denomination,
                            topup_currency: l.currency,
                            price: l.unit_cost,
                            step: '-',
                            fx_rate: '-',
                            currency: 'USD',
                            active: true,
                            country: l.country
                        }
                    }
                } else {
                    //fallback to TRTO
                    obj = {
                        sku: 'TRTO-' + l.operator_id + '-' + l.denomination,
                        account: account._id,
                        name: l.operator_name,
                        operator_id: l.operator_id,
                        min_denomination: l.denomination,
                        max_denomination: l.denomination,
                        topup_currency: l.currency,
                        price: l.unit_cost,
                        step: '-',
                        fx_rate: '-',
                        currency: 'USD',
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
                price: l.unit_cost,
                step: '-',
                fx_rate: '-',
                currency: 'USD',
                active: true,
                country: l.country
                
            }
        }

        if(account.type == 'reseller') {
            const prof = (parseFloat(account.profit_pct) + 100) / 100;
            obj.price = parseFloat(obj.price) * prof;
        } else if(account.type == 'agent') {
            const pa = await Account.findOne({
                _id: account.parent
            }).exec();
            const p1 = (parseFloat(pa.profit_pct) + 100) / 100;
            const p2 = (parseFloat(account.profit_pct) + 100) / 100;
            obj.price = parseFloat(obj.price) * p1 * p2;
        }

        await TransferToPrice.create(obj);
    }
    obj = {
        sku: 'TRTO-' + l.operator_id + '-' + l.denomination,
        account: account._id,
        name: tr2.operator_name,
        operator_id: tr2.operator_id,
        min_denomination: l.denomination,
        max_denomination: l.denomination,
        topup_currency: l.currency,
        price: tprice,
        step: '-',
        fx_rate: '-',
        currency: 'USD',
        active: true,
        country: l.country
    }

    if(account.type == 'reseller') {
        const prof = (parseFloat(account.profit_pct) + 100) / 100;
        obj.price = parseFloat(obj.price) * prof;
    } else if(account.type == 'agent') {
        const parentAccount = await Account.findOne({
            _id: account.parent
        }).exec();
        const p1 = (parseFloat(parentAccount.profit_pct) + 100) / 100;
        const p2 = (parseFloat(account.profit_pct) + 100) / 100;
        obj.price = parseFloat(obj.price) * p1 * p2;
    }

    await TransferToPrice.create(obj);

    process.exit(1);
}

run();