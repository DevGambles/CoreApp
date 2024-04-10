require('dotenv').config({path: './../.env'});
const Account = require('../models/account');
const TopupLog = require('../models/topuplog');

function getTopupGroupCO (topups) {
    const destTopups = {};
    for(let topup of topups) {
        const dest = topup._id.country + '-' + topup._id.operator_name;
        if(!destTopups[dest]) {
            destTopups[dest] = {
                country: topup._id.country,
                operator_name: topup._id.operator_name,
                amount: 0,
                topups: []
            }    
        }
        destTopups[dest].amount += topup.amount;        
        destTopups[dest].topups.push(topup);
    }
    return Object.values(destTopups).sort(function (a, b) {
        return b.amount - a.amount;
    })
}

function getTopupPaidGroupCO (topups) {
    const destTopups = {};
    for(let topup of topups) {
        const dest = topup._id.country + '-' + topup._id.operator_name;
        if(!destTopups[dest]) {
            destTopups[dest] = {
                country: topup._id.country,
                operator_name: topup._id.operator_name,
                paid_amount: 0,
                topups: []
            }
        }
        destTopups[dest].paid_amount += topup.paid_amount;
        destTopups[dest].topups.push(topup);
    }
    return Object.values(destTopups).sort(function (a, b) {
        return b.paid_amount - a.paid_amount;
    })
}

function getTopupGroupCP (topups) {
    const destTopups = {};
    for(let topup of topups) {
        const dest = topup._id.code + '-' + topup._id.paid_currency;
        if(!destTopups[dest]) {
            destTopups[dest] = {
                _id: {
                    code: topup._id.code,
                    paid_currency: topup._id.paid_currency
                },
                count: 0,
                amount: 0
            }    
        }
        destTopups[dest].count += topup.amount;
        destTopups[dest].amount += topup.paid_amount;
    }
    return Object.values(destTopups).sort(function (a, b) {
        return b.count - a.count;
    })
}


function getTopupGroupCPOC(topups) {
    const destTopups = {};
    for(let topup of topups) {
        const dest = topup._id.code + '-' + topup._id.paid_currency + '-' + topup._id.country + '-' + topup._id.operator_name + '-' + topup._id.type;
        if(!destTopups[dest]) {
            destTopups[dest] = {
                _id: {
                    country: topup._id.country,
                    code: topup._id.code,
                    paid_currency: topup._id.paid_currency,
                    operator_name: topup._id.operator_name,
                    type: topup._id.type
                },
                count: 0,
                amount: 0
            }    
        }
        destTopups[dest].amount += topup.paid_amount;
        destTopups[dest].count += topup.amount;
    }
    return Object.values(destTopups).sort(function (a, b) {
        return b.count - a.count;
    })
}

function getTopupGroupCTOC(topups) {
    const destTopups = {};
    for(let topup of topups) {
        const dest = topup._id.code + '-' + topup._id.topup_currency + '-' + topup._id.country + '-' + topup._id.operator_name + '-' + topup._id.type;
        if(!destTopups[dest]) {
            destTopups[dest] = {
                _id: {
                    country: topup._id.country,
                    code: topup._id.code,
                    topup_currency: topup._id.topup_currency,
                    operator_name: topup._id.operator_name,
                    type: topup._id.type
                },
                topup_amount: 0,
                topup_count: 0
            }    
        }
        destTopups[dest].topup_amount += topup.topup_amount;
        destTopups[dest].topup_count += topup.amount;
    }
    return Object.values(destTopups).sort(function (a, b) {
        return b.topup_count - a.topup_count;
    })
}

function getTopupSuccessAmount(topups) {
    const destTopups = {};
    for(let topup of topups) {
        if(topup._id.code == 'RECHARGE_COMPLETE') {
            const dest = topup._id.country + '-' + topup._id.operator_name + '-' + topup._id.type;
            if(!destTopups[dest]) {
                destTopups[dest] = {
                    _id: {
                        country: topup._id.country,
                        operator_name: topup._id.operator_name,
                        type: topup._id.type
                    },
                    amount: 0,
                }
            }
            destTopups[dest].amount += topup.amount;
        }
    }
    return Object.values(destTopups);
}
function getTopupFailAmount(topups) {
    const destTopups = {};
    for(let topup of topups) {
        if(topup._id.code == 'RECHARGE_FAILED') {
            const dest = topup._id.country + '-' + topup._id.operator_name + '-' + topup._id.type;
            if(!destTopups[dest]) {
                destTopups[dest] = {
                    _id: {
                        country: topup._id.country,
                        operator_name: topup._id.operator_name,
                        type: topup._id.type
                    },
                    amount: 0,
                }
            }
            destTopups[dest].amount += topup.amount;
        }
    }
    return Object.values(destTopups)
}

function getTopupByProduct(topups) {
    const destTopups = {};
    for(let topup of topups) {
        if(topup._id.code == 'RECHARGE_COMPLETE') {
            const dest = topup._id.paid_currency + '-' + topup._id.type + '-' + topup._id.country + '-' + topup._id.operator_name;
            if(!destTopups[dest]) {
                destTopups[dest] = {
                    _id: {
                        currency: topup._id.paid_currency,
                        type: topup._id.type,
                        country: topup._id.country,
                        operator_name: topup._id.operator_name
                    },
                    amount: 0,
                    count: 0
                }
            }
            destTopups[dest].amount += topup.paid_amount;
            destTopups[dest].count += topup.amount;
        }
    }
    return Object.values(destTopups);
}

function getTotalAmount(topups) {
    let result = 0;
    for(let topup of topups) {
        result += topup.amount;
    }
    return result;
}

function getChannelStatistics(topups) {
    let result = {
        web: 0,
        api: 0,
        pinp: 0,
        ivr: 0
    };

    for(let topup of topups) {
        if(topup._id.channel && result[topup._id.channel] != undefined) {
            result[topup._id.channel] += topup.amount;
        }
    }
    return result;
}

module.exports = async function run(statTimer, dateFormatter, saveModel) {
    const {start, end, steps} = statTimer;
    const accounts = await Account.find({type: 'agent'}).exec();
    for(let account of accounts) {
        const pipe = [
            {
                $match: {
                    account: account._id,
                    time: {$gte: start, $lte: end}
                },
            },
            {
                $group: {
                    _id: Object.assign({ 
                        country: '$country', 
                        operator_name: '$operator_name',
                        code: '$code',
                        paid_currency: '$paid_currency',
                        topup_currency: '$topup_currency',
                        type: '$type',
                        channel: '$channel'
                    }, dateFormatter.aggregate()),
                    topup_amount: { $sum: '$topup_amount' },
                    paid_amount: { $sum: '$paid_amount' },
                    amount: { $sum: 1 }
                }
            }
        ];

        const topups = await TopupLog.aggregate(pipe).exec();
        
        const top5 = getTopupGroupCO(topups);
        const top5Amount = getTopupPaidGroupCO(topups);
        const resAmountByCode = getTopupGroupCP(topups);
        const resPaidAmount = getTopupGroupCPOC(topups);
        const resTopupAmount = getTopupGroupCTOC(topups);
        
        const stats = [];
        for(let i = steps; i > 0; i --) {
            const timeSpan = statTimer.timeSpanInStep(i);
            const stepStart = timeSpan.start;
            const stepEnd = timeSpan.end;

            const top5DestCount = [];
            const top5DestAmount = [];
            for(let entry of top5) {
                const topupCount = getTotalAmount(entry.topups.filter(function (topup) {
                    return dateFormatter.compare(stepStart, stepEnd, topup);
                }));

                top5DestCount.push({
                    country: entry.country,
                    operator_name: entry.operator_name,
                    count: topupCount
                })
            }
    
            for(let entry of top5Amount) {
                const topupAmount = entry.topups.filter(function (topup) {
                    return dateFormatter.compare(stepStart, stepEnd, topup)
                }).reduce((acc, val) => {
                    return acc + parseFloat(val.paid_amount)
                }, 0);
                top5DestAmount.push({
                    country: entry.country,
                    operator_name: entry.operator_name,
                    amount: topupAmount,
                });
            }
            
            const subTopups = topups.filter(function (topup) {
                return dateFormatter.compare(stepStart, stepEnd, topup)
            });

            const resSuccess = getTopupSuccessAmount(subTopups);
            const resFail = getTopupFailAmount(subTopups);
            const successfulCount = getTotalAmount(resSuccess);
            const failCount = getTotalAmount(resFail);
            const channelStats= getChannelStatistics(subTopups);
            const topupsByProduct = getTopupByProduct(subTopups);

            const destSuccessFail = {
                sux: resSuccess,
                fail: resFail
            };
    
            stats.push({
                topups: topups.filter(function (topup) {
                    return dateFormatter.compare(stepStart, stepEnd, topup)
                }),
                top5_dest_count: top5DestCount,
                top5_dest_amount: top5DestAmount,
                suxx_vs_fail: {
                    successful: successfulCount,
                    failed: failCount,
                    date: dateFormatter.format(stepStart),
                },
                topups_by_product: topupsByProduct,
                topups_by_channel: channelStats,
                dest_suxx_vs_fail: destSuccessFail,
                time: dateFormatter.format(stepStart),
                ts: stepStart
            });
        }
    
        const obj = {
            account: account._id,
            time: statTimer.time,
            time_from: start,
            time_to: end,
            amounts_by_code: resAmountByCode,
            stats: stats,
            paid_amount: resPaidAmount,
            topup_amount: resTopupAmount
        };
        await saveModel.create(obj);
        console.log('Processed one account');
    }
}