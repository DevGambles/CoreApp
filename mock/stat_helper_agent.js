require('dotenv').config({path: './../.env'});
const TopupLog = require('../models/topuplog');
const Transaction = require('../models/transaction');

module.exports = {
    getTopupGroupCPCOT: function (country, start, end) {
        const pipe = [
            {
                $match: {
                    country: country,
                    time: {$gte: start, $lte: end}
                }
            },
            {
                $group: {
                    _id: {
                        country: '$country',
                        currency: '$paid_currency',
                        code: '$code',
                        operator_name: '$operator_name',
                        tag: '$tag'
                    },
                    count: {
                        $sum: 1
                    },
                    amount: {
                        $sum: '$paid_amount'
                    }
                }
            }
        ];

        return TopupLog.aggregate(pipe).exec();
    },
    getTopupGroupCO: function (accounts, start, end) {
        const pipe = [
            {
                $match: {
                    account: Array.isArray(accounts) ? {$in: accounts} : accounts,
                    time: {$gte: start, $lte: end}
                },
            },
            {
                $group: {
                    _id: { 
                        country: '$country', 
                        operator_name: '$operator_name',
                    },
                    amount: {
                        $sum: 1 
                    }
                }
            },
            {
                $sort: {
                    amount: -1
                }
            }
        ];
        return TopupLog.aggregate(pipe).exec();
    },
    getTopupPaidGroupCO: function (accounts, start, end) {
        const pipe = [
            {
                $match: {
                    account: Array.isArray(accounts) ? {$in: accounts} : accounts,
                    time: {$gte: start, $lte: end}
                },
            },
            {
                $group: {
                    _id: { 
                        country: '$country', 
                        operator_name: '$operator_name',
                    },
                    amount: {
                        $sum: '$paid_amount' 
                    }
                }
            },
            {
                $sort: {
                    amount: -1
                }
            }
        ];
        return TopupLog.aggregate(pipe).exec();
    },
    getTopupGroupCP: function (accounts, start, end) {
        const pipe = [
            {
                $match: {
                    account: Array.isArray(accounts) ? {$in: accounts}: accounts,
                    time: {$gte: start, $lte: end}
                }
            },
            {
                $group: {
                    _id: {
                        code: '$code',
                        paid_currency: '$paid_currency'
                    },
                    count: {
                        $sum: 1
                    },
                    amount: {
                        $sum: '$paid_amount'
                    }
                }
            },
            {
                $sort: {
                    count: -1
                }
            }
        ];
        return TopupLog.aggregate(pipe).exec();
    },
    getTransactionGroupCInDeb: function (accounts, start, end) {
        const pipe = [
            {
                $match: {
                    account: {
                        $in: accounts
                    },
                    time: {$gte: start, $lte: end},
                    type: 'deb'
                }
            }, {
                $group: {
                    _id: '$currency',
                    amount: { $sum: '$amount' }
                }
            }, {
                $sort: {amount: -1}
            }
        ];
        return Transaction.aggregate(pipe).exec();
    },
    getTransactionGroupCInCrd: function (accounts, start, end) {
        const pipe = [
            {
                $match: {
                    account: {
                        $in: accounts
                    },
                    time: {$gte: start, $lte: end},
                    type: 'crd'
                }
            }, {
                $group: {
                    _id: '$currency',
                    amount: { $sum: '$amount' }
                }
            }, {
                $sort: {amount: -1}
            }
        ];
        return Transaction.aggregate(pipe).exec();
    },
    getTopupGroupCPCO: function(accounts, start, end) {
        const pipe = [
            {
                $match: {
                    account: Array.isArray(accounts) ? {$in: accounts}: accounts,
                    time: {$gte: start, $lte: end}
                }
            }, {
                $group: {
                    _id: {
                        code: '$code',
                        paid_currency: '$paid_currency',
                        country: '$country',
                        operator_name: '$operator_name'
                    },
                    count: { $sum: 1 },
                    amount: { $sum: '$paid_amount' }
                }
            }, {
                $sort: { count: -1 }
            }
        ];
        return TopupLog.aggregate(pipe).exec();
    },
    getTopupGroupAP: function(accounts, start, end) {
        const pipe = [
            {
                $match: {
                    account: {$in: accounts},
                    time: {$gte: start, $lte: end}
                }
            }, {
                $group: {
                    _id: {
                        account: '$account',
                        paid_currency: '$paid_currency'
                    },
                    paid_amount: {$sum: '$paid_amount'}
                }
            }, {
                $sort: {
                    paid_amount: -1
                }
            }
        ];
        return TopupLog.aggregate(pipe).exec();
    },
    getTopupPaidACGroupAP: function(accounts, start, end) {
        const pipe = [
            {
                $match: {
                    account: Array.isArray(accounts) ? {$in: accounts}: accounts,
                    time: {$gte: start, $lte: end}
                }
            }, {
                $group: {
                    _id: {
                        account: '$account',
                        paid_currency: '$paid_currency'
                    },
                    paid_amount: {$sum: '$paid_amount'},
                    paid_count: {$sum: 1}
                }
            }, {
                $sort: {
                    paid_amount: -1
                }
            }
        ];
        return TopupLog.aggregate(pipe).exec();
    },
    getTopupGroupAPT: function (account, start, end) {
        const pipe = [
            {
                $match: {
                    account: account,
                    time: {$gte: start, $lte: end}
                }
            }, {
                $group: {
                    _id: {
                        account: '$account',
                        paid_currency: '$paid_currency',
                        topup_currency: '$topup_currency'
                    },
                    paid_amount: { $sum: '$paid_amount' },
                    paid_count: { $sum: 1 },
                    topup_amount: { $sum: '$topup_amount' },
                    topup_count: { $sum: 1 }
                }
            }, {
                $sort: { paid_amount: -1 }
            }
        ];
        return TopupLog.aggregate(pipe).exec();
    },
    getTopupSuccessAmount: function (accounts, start, end) {
        const pipe = [
            {
                $match: {
                    account: Array.isArray(accounts) ? { $in: accounts }: accounts,
                    time: { $gte: start, $lte: end },
                    success: true
                }
            }, {
                $group: {
                    _id: { country: '$country', operator_name: '$operator_name' },
                    amount: { $sum: 1 }
                }
            }, {
                $sort: {
                    amount: -1
                }
            }
        ];

        return TopupLog.aggregate(pipe).exec();
    },
    getTopupFailAmount: function (accounts, start, end) {
        const pipe = [
            {
                $match: {
                    account: Array.isArray(accounts) ? { $in: accounts }: accounts,
                    time: { $gte: start, $lte: end },
                    success: false
                }
            }, {
                $group: {
                    _id: { country: '$country', operator_name: '$operator_name' },
                    amount: { $sum: 1 }
                }
            }, {
                $sort: {
                    amount: -1
                }
            }
        ];

        return TopupLog.aggregate(pipe).exec();
    },
    getTopupsByProduct: function (accounts, start, end) {
        const pipe = [
            {
                $match: {
                    account: Array.isArray(accounts) ? { $in: accounts }: accounts,
                    time: { $gte: start, $lte: end },
                }
            }, {
                $group: {
                    _id: { account: '$account', currency: '$paid_currency', type: '$type', country: '$country', operator_name: '$operator_name'},
                    amount: {$sum: '$paid_amount'},
                    count: {$sum: 1}
                }
            }
        ];

        return TopupLog.aggregate(pipe).exec();
    },
    getTopupCountBySuccessStat: function (accounts, start, end, success) {
        return TopupLog.count({
            account: Array.isArray(accounts) ? { $in: accounts }: accounts,
            time: { $gte: start, $lte: end },
            success: success
        }).exec();
    },
    getTopupCountByChannel: function (accounts, start, end, channel) {
        return TopupLog.count({
            account: Array.isArray(accounts) ? {$in: accounts}: accounts,
            time: {$gte: start, $lte: end},
            channel: channel
        }).exec();
    },
    getTopupGroupCPOC: function (accounts, start, end) {
        const pipe = [
            {
                $match:{
                    account: Array.isArray(accounts) ? { $in: accounts }: accounts,
                    time: {$gte: start, $lte: end}
                }
            }, {
                $group: {
                    _id: { 
                        country: '$country', 
                        paid_currency: '$paid_currency', 
                        operator_name: '$operator_name', 
                        code: '$code'
                    },
                    paid_amount: { $sum: '$paid_amount' },
                    paid_count: { $sum: 1 }
                }
            }, {
                $sort: {paid_count: -1}
            }
        ];
        return TopupLog.aggregate(pipe).exec();
    },
    getTopupGroupCTOC: function(accounts, start, end) {
        const pipe = [
            {
                $match: {
                    account: Array.isArray(accounts) ? { $in: accounts }: accounts,
                    time: {$gte: start, $lte: end}
                }
            }, {
                $group: {
                    _id: { 
                        country: '$country',
                        topup_currency: '$topup_currency',
                        operator_name: '$operator_name',
                        code: '$code'
                    },
                    topup_amount: { $sum: '$topup_amount' },
                    topup_count: { $sum: 1 }
                }
            }, {
                $sort: { topup_count: -1 }
            }
        ]
        return TopupLog.aggregate(pipe).exec();
    },
    memorySizeOf: function (obj) {
        var bytes = 0;
    
        function sizeOf(obj) {
            if(obj !== null && obj !== undefined) {
                switch(typeof obj) {
                case 'number':
                    bytes += 8;
                    break;
                case 'string':
                    bytes += obj.length * 2;
                    break;
                case 'boolean':
                    bytes += 4;
                    break;
                case 'object':
                    var objClass = Object.prototype.toString.call(obj).slice(8, -1);
                    if(objClass === 'Object' || objClass === 'Array') {
                        for(var key in obj) {
                            if(!obj.hasOwnProperty(key)) continue;
                            sizeOf(obj[key]);
                        }
                    } else bytes += obj.toString().length * 2;
                    break;
                }
            }
            return bytes;
        };
    
        function formatByteSize(bytes) {
            if(bytes < 1024) return bytes + " bytes";
            else if(bytes < 1048576) return(bytes / 1024).toFixed(3) + " KiB";
            else if(bytes < 1073741824) return(bytes / 1048576).toFixed(3) + " MiB";
            else return(bytes / 1073741824).toFixed(3) + " GiB";
        };
    
        return sizeOf(obj);
    }
    
}