require('dotenv').config({path: './../.env'});
const TopupLog = require('../models/topuplog');
const Transaction = require('../models/transaction');

module.exports = {
    getTopupGroupCountry: function(accounts, start, end) {
        const match = {
            account: {$in: accounts},
            time: {$gte: start, $lte: end}
        }

        if(!accounts) {
            delete match.account;
        }

        const pipe = [
            {
                $match: match
            }, {
                $group: {
                    _id: '$country',
                    count: { $sum: 1 }
                }
            }, {
                $sort: {
                    count: -1
                }
            }
        ];
        return TopupLog.aggregate(pipe).exec();
    },
    
    getTopupGroupDest: function(accounts, start, end) {
        const match = {
            account: {$in: accounts},
            time: {$gte: start, $lte: end}
        }

        if(!accounts) {
            delete match.account;
        }

        const pipe = [
            {
                $match: match
            }, {
                $group: {
                    _id: { country: '$country', operator: '$operator_name' },
                    count: { $sum: 1 }
                }
            }, {
                $sort: { count: -1 }
            }
        ];
        return TopupLog.aggregate(pipe).exec();
    },
    getTopupGroupAccount: function(accounts, start, end) {
        const match = {
            account: {$in: accounts},
            time: {$gte: start, $lte: end}
        }

        if(!accounts) {
            delete match.account;
        }

        const pipe = [
            {
                $match: match
            }, {
                $group: {
                    _id: '$account',
                    count: { $sum: 1 }
                }
            }, {
                $sort: { count: -1 }
            }, { $limit : 30 }
        ];
        return TopupLog.aggregate(pipe).exec();
    },
    getTransactionGroupCurrency: function (accounts, start, end) {
        const match = {
            account: {$in: accounts},
            time: {$gte: start, $lte: end}
        }

        if(!accounts) {
            delete match.account;
        }

        const pipe = [
            {
                $match: match
            }, {
                $group: {
                    _id: '$currency',
                    count: { $sum: 1 }
                }
            }, {
                $sort: { count: -1 }
            }
        ];

        return Transaction.aggregate(pipe).exec();
    },
    getTopupGroupCTCOT: function (accounts, country, start, end) {
        const match = {
            account: { $in: accounts },
            country: country,
            time: { $gte: start, $lte: end }
        }
        if(!accounts) {
            delete match.account;
        }

        const pipe = [
            {
                $match: match
            }, {
                $group: {
                    _id: {
                        country: '$country',
                        currency: '$topup_currency',
                        code: '$code',
                        operator_name: '$operator_name',
                        tag: '$tag',
                        type: '$type'
                    },
                    count: { $sum: 1 },
                    amount: { $sum: '$topup_amount' }
                }
            }
        ];

        return TopupLog.aggregate(pipe).exec();
    },
    getTopupGroupCPCOT: function (accounts, country, start, end) {
        const match = {
            account: { $in: accounts },
            country: country,
            time: { $gte: start, $lte: end }
        };

        if(!accounts) {
            delete match.account;
        }
        
        const pipe = [
            {
                $match: match,
            }, {
                $group: {
                    _id: {
                        country: '$country',
                        currency: '$paid_currency',
                        code: '$code',
                        operator_name: '$operator_name',
                        tag: '$tag',
                        type: '$type'
                    },
                    count: { $sum: 1 },
                    amount: { $sum: '$paid_amount' }
                }
            }
        ];
        return TopupLog.aggregate(pipe).exec();
    },
    getTopupGroupATCCOT: function (account, start, end) {
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
                        currency: '$topup_currency',
                        code: '$code',
                        country: '$country',
                        operator_name: '$operator_name',
                        tag: '$tag',
                        type: '$type'
                    },
                    count: { $sum: 1 },
                    amount: { $sum: '$topup_amount' }
                }
            }
        ];
        return TopupLog.aggregate(pipe).exec();
    },
    getTopupGroupAPCCOT: function (account, start, end) {
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
                        currency: '$paid_currency',
                        code: '$code',
                        country: '$country',
                        operator_name: '$operator_name',
                        tag: '$tag',
                        type: '$type'
                    },
                    count: { $sum: 1 },
                    amount: { $sum: '$paid_amount' }
                }
            }
        ];
        return TopupLog.aggregate(pipe).exec();
    },
    getTopupCountBySuccessStat: function (accounts, start, end, success) {
        return TopupLog.count({
            account: { $in: accounts },
            time: { $gte: start, $lte: end },
            success: success
        }).exec();
    },
    getTopupCountByChannel: function (accounts, start, end, channel) {
        return TopupLog.count({
            account: {$in: accounts},
            time: {$gte: start, $lte: end},
            channel: channel
        }).exec();
    },
}