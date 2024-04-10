var app = {};
var Gloprefix = require('../models/gloprefix')
var Provmapping = require('../models/provmapping')
var Operator = require('../models/operator')
var Prefix = require('../models/prefix')
var Account = require('../models/account')
var ProfitMap = require('../models/profitmap')
var Rate = require('../models/rate');
var Transaction = require('../models/transaction');
var TopupLog = require('../models/topuplog')
var Apicred = require('../models/apicred')
var sms = require('./smpp')
var s = require('./soapclient')
var co = require('co');
var parallel = require('co-parallel');
var sleep = require('sleep-promise');
var NumLookup = require('./locnumberlookup');
function randomIntFromInterval(min,max) {
    return Math.floor(Math.random()*(max-min+1)+min);
}
app.charge = function (a, fa, ba) {
    return new Promise(function (resolve, reject) {
        co(function* () {
            var ProceedWithBackup = false;
            var TxPossible = false;
            var ConvNeeded = false;
            var doPrimary = false;
            var temp = {};
            if (ba == null) {
                var SkipBackup = true;
            } else {
                var SkipBackup = false;
            }
            var Acc = yield Account.findOne({_id : a}).exec();
            //find wallet in fo 
            Acc.wallets.forEach(function (w) {
                if (w.currency == fa.currency) {
                    //we have it 
                    var nb = w.balance - parseFloat(fa.amount);
                    if (nb > 0) {
                        TxPossible = true;
                        //make TX with main option
                        ProceedWithBackup = false;
                        w.balance = nb;
                    } else {
                        TxPossible = false;
                        if (!SkipBackup) {
                            ProceedWithBackup = false;
                        }
                        
                    }
                } else {
                    doPrimary = true;
                }
            })
            if (!TxPossible && doPrimary) {
                for (i=0; i < Acc.wallets.length; i++) {
                    var w = Acc.wallets[i];
                    if (w.primary === true) {
                           if (fa.currency == w.currency) {
                            //same currency 
                            var nb = w.balance - parseFloat(fa.amount);
                                if (nb > 0) {
                                    TxPossible = true;
                                    ConvNeeded = false;
                                    //make TX with main option
                                    w.balance = nb;
                                } else {
                                    TxPossible = false;
                                    if (!SkipBackup) {
                                        ProceedWithBackup = true;
                                    }
                                    
                                }
                        } else {
                            var rate = yield Rate.findOne({source : fa.currency, destination : w.currency}).exec();
                            var rateRev = yield Rate.findOne({destination : fa.currency, source : w.currency}).exec();
                            if (rate !== null) {
                                //we have rate 
                                var na = parseFloat(fa.amount) * parseFloat(rate.rate);
                                var nb = w.balance - na;
                                 if (nb > 0) {
                                    TxPossible = true;
                                    ConvNeeded = true;
                                    temp.ConvAmt = na;
                                    temp.ConvCur = w.currency;
                                    //make TX with main option
                                    w.balance = nb;
                                } else {
                                    TxPossible = false;
                                    if (!SkipBackup) {
                                        ProceedWithBackup = true;
                                    }
                                    
                                }
                            } else if (rateRev !== null) {
                                 var na = parseFloat(fa.amount) / parseFloat(rateRev.rate);
                                var nb = w.balance - na;
                                 if (nb > 0) {
                                    TxPossible = true;
                                    ConvNeeded = true;
                                    temp.ConvAmt = na;
                                    temp.ConvCur = w.currency;
                                    //make TX with main option
                                    w.balance = nb;
                                } else {
                                    TxPossible = false;
                                    if (!SkipBackup) {
                                        ProceedWithBackup = true;
                                    }
                            }  
                        } else {
                                if (!SkipBackup) {
                                    ProceedWithBackup = true;
                                } else {
                                    var  err = {}
                                err.code = "CUR_XCH_FAILURE"
                                err.message = "Sorry, we do not support Currency exchange between : " + fa.currency + " (Transaction backup currency) and  : " + w.currency + " (your primary wallet currency), please contact support";
                                err.status = 500;
                                return reject(err);
                                }
                                
                            }
                        }
                    }
                }
            }
            if (!SkipBackup) {
            if (ProceedWithBackup) {
                for (i=0; i < Acc.wallets.length; i++) {
                    var w = Acc.wallets[i];
                               if (w.primary === true) {
                        //we're at primary wallet 
                        if (ba.currency == w.currency) {
                            //same currency 
                            var nb = w.balance - parseFloat(ba.amount);
                                if (nb > 0) {
                                    TxPossible = true;
                                    ConvNeeded = false;
                                    //make TX with main option
                                    w.balance = nb;
                                } else {
                                    TxPossible = false;
                                    ProceedWithBackup = false;
                                }
                        } else {
                            var rate = yield Rate.findOne({source : ba.currency, destination : w.currency}).exec();
                            var rateRev = yield Rate.findOne({destination : ba.currency, source : w.currency}).exec();
                            if (rate !== null) {
                                //we have rate 
                                var na = parseFloat(ba.amount) * parseFloat(rate.rate);
                                var nb = w.balance - na;
                                 if (nb > 0) {
                                    TxPossible = true;
                                    ConvNeeded = true;
                                    temp.ConvAmt = na;
                                    temp.ConvCur = w.currency;
                                    //make TX with main option
                                    w.balance = nb;
                                } else {
                                    TxPossible = false;
                                    ProceedWithBackup = false;
                                }
                            } else if (rateRev !== null) { 
                                 var na = parseFloat(ba.amount) / parseFloat(rateRev.rate);
                                var nb = w.balance - na;
                                 if (nb > 0) {
                                    TxPossible = true;
                                    ConvNeeded = true;
                                    temp.ConvAmt = na;
                                    temp.ConvCur = w.currency;
                                    //make TX with main option
                                    w.balance = nb;
                                } else {
                                    TxPossible = false;
                                    ProceedWithBackup = false;
                                }
                            } else {
                                var  err = {}
                                err.code = "CUR_XCH_FAILURE"
                                err.message = "Sorry, we do not support Currency exchange between : " + ba.currency + " (Transaction backup currency) and  : " + w.currency + " (your primary wallet currency), please contact support";
                                err.status = 500;
                                return reject(err);
                            }
                        }
                    }
                }
            }
            }
            if (TxPossible) {
                Acc.save();
                var Tx = new Transaction();
                    Tx.time = new Date(),
                    Tx.account = Acc._id;
                    Tx.type = 'deb';
                    if (!ProceedWithBackup) {
                        if (ConvNeeded) {
                            Tx.amount = temp.ConvAmt.toFixed(2);
                            Tx.currency = temp.ConvCur;
                        } else {
                            Tx.amount = fa.amount;
                        Tx.currency = fa.currency;
                        }
                        
                    } else {
                        if (ConvNeeded) {
                            Tx.amount = temp.ConvAmt.toFixed(2);
                            Tx.currency = temp.ConvCur;
                        } else {
                            Tx.amount = ba.amount;
                            Tx.currency = ba.currency;
                        }
                    }
                    Tx.description = 'Topup of ' + fa.msisdn + ' for ' + fa.topAmt + ' ' + fa.topCur + ' paid with ' + Tx.amount + ' ' + Tx.currency;
                    Tx.target = fa.msisdn;
                    Tx.source = 'Topup request';
                    var t = yield Tx.save();
                    resolve(t);
                    
            } else {
                //tx is not possible reject
                var err = {}
                err.code = "INSUFFICIENT_FUNDS"
                err.message = "None of your wallets contain the sum enough to perform this transaction";
                err.status = 500;
                return reject(err);
            }


        }).catch(function (err) {
          return reject(err);
        })
    })
}
app.arbCharge = function (a, o) {
return new Promise(function (resolve, reject) {
        co(function* () {
            var Acc = yield Account.findOne({_id : a}).exec();
            if (Acc !== null) {
                var mywal = []
                    /*
                    o.amount 
                    o.currency
                    o.description
                    */
                    var ProceedWithBackup = false;
                    var TxPossible = false;
                    var ConvNeeded = false;
                    var temp= {}
                    Acc.wallets.forEach(function (w) {
                        mywal.push(w.currency);
                    })
                    if (mywal.contains(o.currency)) {
                        //try it first
                        for (i=0; i < Acc.wallets.length; i++) {
                            var w = Acc.wallets[i];
                            if (w.currency == o.currency) {
                                //we have right One 
                                var nb = w.balance - o.amount;
                                if (nb > 0) {
                                    w.balance = nb;
                                    ProceedWithBackup = false;
                                    TxPossible = true;
                                } else {
                                    ProceedWithBackup = true;
                                    TxPossible = false;
                                }
                            }
                        }
                        if (ProceedWithBackup) {
                            for (i=0; i < Acc.wallets.length; i++) {
                                var w = Acc.wallets[i];
                                if (w.primary === true) {
                                    if (w.currency == o.currency) {
                                        var nb = w.balance - o.amount;
                                if (nb > 0) {
                                    w.balance = nb;
                                    ProceedWithBackup = false;
                                    TxPossible = true;
                                } else {
                                    ProceedWithBackup = false;
                                    TxPossible = false;
                                }
                                    } else {
                                        var rate = yield Rate.findOne({source : o.currency, destination : w.currency}).exec();
                                        var rateRev = yield Rate.findOne({source : w.currency, destination : o.currency}).exec();
                                        if (rate !== null) {
                                            var na = parseFloat(o.amount) * parseFloat(rate.rate);
                                                var nb = w.balance - na;
                                                if (nb > 0) {
                                                    TxPossible = true;
                                                    ConvNeeded = true;
                                                    temp.ConvAmt = na;
                                                    temp.ConvCur = w.currency;
                                                    //make TX with main option
                                                    w.balance = nb;
                                                } else {
                                                    TxPossible = false;
                                                    ProceedWithBackup = false;
                                                }
                                        } else if (rateRev !== null) {
                                            //doing reverse rate 
                                            var na = parseFloat(o.amount) / parseFloat(rateRev.rate);
                                                var nb = w.balance - na;
                                                if (nb > 0) {
                                                    TxPossible = true;
                                                    ConvNeeded = true;
                                                    temp.ConvAmt = na;
                                                    temp.ConvCur = w.currency;
                                                    //make TX with main option
                                                    w.balance = nb;
                                                } else {
                                                    TxPossible = false;
                                                    ProceedWithBackup = false;
                                                }
                                        } else {
                                            //try reverse 
                                            
                                            var  err = {}
                                            err.code = "CUR_XCH_FAILURE"
                                            err.message = "Sorry, we do not support Currency exchange between : " + o.currency + " (Transaction currency) and  : " + w.currency + " (your primary wallet currency), please contact support";
                                            err.status = 500;
                                            return reject(err);
                                        }
                                    }
                                }
                            }
                        }

                    } else {
                                                    for (i=0; i < Acc.wallets.length; i++) {
                                var w = Acc.wallets[i];
                                if (w.primary === true) {
                                    if (w.currency == o.currency) {
                                        var nb = w.balance - o.amount;
                                if (nb > 0) {
                                    w.balance = nb;
                                    ProceedWithBackup = false;
                                    TxPossible = true;
                                } else {
                                    ProceedWithBackup = false;
                                    TxPossible = false;
                                }
                                    } else {
                                         var rate = yield Rate.findOne({source : o.currency, destination : w.currency}).exec();
                                        var rateRev = yield Rate.findOne({source : w.currency, destination : o.currency}).exec();
                                        console.log('RR', rate, rateRev);
                                        if (rate !== null) {
                                            var na = parseFloat(o.amount) * parseFloat(rate.rate);
                                                var nb = w.balance - na;
                                                if (nb > 0) {
                                                    TxPossible = true;
                                                    ConvNeeded = true;
                                                    temp.ConvAmt = na;
                                                    temp.ConvCur = w.currency;
                                                    //make TX with main option
                                                    w.balance = nb;
                                                } else {
                                                    TxPossible = false;
                                                    ProceedWithBackup = false;
                                                }
                                        } else if (rateRev !== null) {
                                            //doing reverse rate 
                                            var na = parseFloat(o.amount) / parseFloat(rateRev.rate);
                                                var nb = w.balance - na;
                                                if (nb > 0) {
                                                    TxPossible = true;
                                                    ConvNeeded = true;
                                                    temp.ConvAmt = na;
                                                    temp.ConvCur = w.currency;
                                                    //make TX with main option
                                                    w.balance = nb;
                                                } else {
                                                    TxPossible = false;
                                                    ProceedWithBackup = false;
                                                }
                                        } else {
                                            //try reverse 
                                            
                                            var  err = {}
                                            err.code = "CUR_XCH_FAILURE"
                                            err.message = "Sorry, we do not support Currency exchange between : " + o.currency + " (Transaction currency) and  : " + w.currency + " (your primary wallet currency), please contact support";
                                            err.status = 500;
                                            return reject(err);
                                        }
                                    }
                                }
                            }
                    }
                    if (TxPossible) {
                        var x = yield Acc.save();
                        var tx1 = new Transaction();
                            tx1.account = Acc._id;
                            tx1.time = new Date();
                            if (o.amount > 0) {
                                tx1.type = 'deb'
                            } else {
                                tx1.type = 'crd'
                            }
                            if (ConvNeeded) {
                                tx1.amount = temp.ConvAmt;
                                tx1.currency = temp.ConvCur;
                            } else {
                                tx1.amount = o.amount;
                                tx1.currency = o.currency;
                            }
                            tx1.description = o.description;
                            tx1.source = 'System';
                            var t = yield tx1.save();
                            resolve(t);
                    } else {
                        var err = {}
                        err.code = "INSUFFICIENT_FUNDS"
                        err.message = "None of your wallets contain the sum enough to perform this transaction";
                        err.status = 402;
                        return reject(err);
                    }
            } else {
                var err = {};
                err.code = 'ACCOUNT_NOT_FOUND';
                err.message = 'Account not found';
                err.status = 404
                return reject(err)
            }


        }).catch(function (err) {
          return reject(err);
        })
    })
}
app.chargeAndSendSms = function (a, to, text) {
return new Promise(function (resolve, reject) {
        co(function* () {
            var Acc = yield Account.findOne({_id : a}).exec();
            var temp = {}
            if (Acc !== null) {
                var mywal = []
                   var o = {};
                   o.amount = Acc.sms_cost;
                   o.currency = 'USD'
                   o.description = 'Charge for SMS to ' + to;
                    var ProceedWithBackup = false;
                    var TxPossible = false;
 
                   
                            for (i=0; i < Acc.wallets.length; i++) {
                                var w = Acc.wallets[i];
                                if (w.primary === true) {
                                    if (w.currency == o.currency) {
                                        var nb = w.balance - o.amount;
                                if (nb > 0) {
                                    w.balance = nb;
                                    ProceedWithBackup = false;
                                    TxPossible = true;
                                } else {
                                    ProceedWithBackup = false;
                                    TxPossible = false;
                                }
                                    } else {
                                         var rate = yield Rate.findOne({source : o.currency, destination : w.currency}).exec();
                                        var rateRev = yield Rate.findOne({source : w.currency, destination : o.currency}).exec();
                                        if (rate !== null) {
                                            var na = parseFloat(o.amount) * parseFloat(rate.rate);
                                                var nb = w.balance - na;
                                                if (nb > 0) {
                                                    TxPossible = true;
                                                    ConvNeeded = true;
                                                    temp.ConvAmt = na;
                                                    temp.ConvCur = w.currency;
                                                    //make TX with main option
                                                    w.balance = nb;
                                                } else {
                                                    TxPossible = false;
                                                    ProceedWithBackup = false;
                                                }
                                        } else if (rateRev !== null) {
                                            //doing reverse rate 
                                            var na = parseFloat(o.amount) / parseFloat(rateRev.rate);
                                                var nb = w.balance - na;
                                                if (nb > 0) {
                                                    TxPossible = true;
                                                    ConvNeeded = true;
                                                    temp.ConvAmt = na;
                                                    temp.ConvCur = w.currency;
                                                    //make TX with main option
                                                    w.balance = nb;
                                                } else {
                                                    TxPossible = false;
                                                    ProceedWithBackup = false;
                                                }
                                        } else {
                                            //try reverse 
                                            
                                            var  err = {}
                                            err.code = "CUR_XCH_FAILURE"
                                            err.message = "Sorry, we do not support Currency exchange between : " + o.currency + " (Transaction currency) and  : " + w.currency + " (your primary wallet currency), please contact support";
                                            err.status = 500;
                                            return reject(err);
                                        }
                                    }
                                }
                            }
                        

                    if (TxPossible) {
                        var tx1 = new Transaction();
                            tx1.account = Acc._id;
                            tx1.time = new Date();
                            if (o.amount > 0) {
                                tx1.type = 'deb'
                            } else {
                                tx1.type = 'crd'
                            }
                            if (ConvNeeded) {
                                tx1.amount = temp.ConvAmt;
                                tx1.currency = temp.ConvCur;
                            } else {
                                tx1.amount = o.amount;
                                tx1.currency = o.currency;
                            }
                            tx1.description = o.description;
                            tx1.source = 'System';
                            var t = yield tx1.save();
                            var sender = Acc.sms_sender || 'PrimeAir'
                            var so = sms.send(sender, to, text);
                            resolve(so);
                    } else {
                        var err = {}
                        err.code = "INSUFFICIENT_FUNDS"
                        err.message = "None of your wallets contain the sum enough to perform this transaction";
                        err.status = 500;
                        return reject(err);
                    }
            } else {
                var err = {};
                err.code = 'ACCOUNT_NOT_FOUND';
                err.message = 'Account not found';
                err.status = 404
                return reject(err)
            }


        }).catch(function (err) {
          return reject(err);
        })
    })
}
app.refund = function (tl) {
    return new Promise(function (resolve, reject) {
        co(function* () {
            var temp = {};
            temp.tx = [];
            var Tl = yield TopupLog.findOne({_id : tl}).exec();
            for (var i=0; i < Tl.related_transactions.length; i++) {
                var txid = Tl.related_transactions[i];
                var tx = yield Transaction.findOne({_id : txid}).exec();
                if (tx !== null) {
                    var randomMs = randomIntFromInterval(1, 800);
                    var xaxa = yield sleep(randomMs);
                    var txa = yield Account.findOne({_id : tx.account}).exec();
                    for (var a=0; a < txa.wallets.length; a++ ) {
                        w = txa.wallets[a];
                        if (w.currency == tx.currency) {
                            if (tx.type == 'deb') {
                                var tr1 = new Transaction();
                                tr1.balance_before = w.balance;
                                w.balance += parseFloat(tx.amount);
                                
                                tr1.account = txa._id;
                                tr1.type = 'crd';
                                tr1.time = new Date()
                                tr1.amount = tx.amount;
                                tr1.currency = tx.currency;
                                tr1.balance_after = w.balance;
                                tr1.wallet_id = w.wallet_id;
                                tr1.description = 'Reverse transaction ' + txid + '/ TL:' + Tl.operator_reference;
                                tr1.source = 'Refund system';
                                var txz = yield tr1.save();
                                var txf = txa.save();
                                temp.tx.push(txz._id);
                            } else if (tx.type == 'crd') {
                                var tr1 = new Transaction();
                                tr1.balance_before = w.balance;
                                w.balance += parseFloat(tx.amount * -1);
                                tr1.account = txa._id;
                                tr1.type = 'deb';
                                tr1.time = new Date()
                                tr1.amount = tx.amount;
                                tr1.currency = tx.currency;
                                tr1.balance_after = w.balance;
                                tr1.wallet_id = w.wallet_id;
                                tr1.description = 'Reverse transaction ' + txid + '/ TL:' + Tl.operator_reference;
                                tr1.source = 'Refund system';
                                var txz = yield tr1.save();
                                var txf = txa.save();
                                temp.tx.push(txz._id);
                            }
                        }
                    }
                    //var txf = txa.save();
                } else {
                    /*
                    var err = {}
                    err.code = "EDB_FAILURE"
                    err.message = "Could not find transaction with id " + txid;
                    err.status = 500;
                    return reject(err);
                    */
                }
            }
            for (var s=0; s < temp.tx.length; s++) {
                Tl.related_transactions.push(temp.tx[s]);
            }
            var fin = yield Tl.save();
            resolve(fin);

        }).catch(function (err) {
            return reject(err);
        })
    })
}

app.applyCommission = function (a, tl, pmap) {
return new Promise(function (resolve, reject) {
        co(function* () {
            var Acc = yield Account.findOne({_id : a}).exec();
            var Tl = yield TopupLog.findOne({_id : tl}).exec();
            var p = {};
            if (Acc.type !== 'agent') {
                var err = {};
                err.code = "EDB_FAILURE"
                err.message  = "Somthing is wrong, non-agent cannot perform transactions";
                err.status = 500
                return reject(err);
            }
            var Parent = yield Account.findOne({_id : Acc.parent}).exec();
            if (Parent.type == 'reseller') {
                var txamt = ((parseFloat(Tl.paid_amount) * pmap.agentProfit) / 100);
                var txcur = Tl.paid_currency;
                var fsu = false;
                var fsb = true;
                for (i=0; i <= Parent.wallets.length; i++) {
                    if (Parent.wallets[i].currency == txcur) {
                        fsu = true;
                        Parent.wallets[i].balance += txamt;
                        p.cAmt = txamt;
                        p.cCur = txcur;
                    }
                }
                if (!fsu) {
                    p.wal = [];
                    for (i=0; i < Parent.wallets.length; i++) {
                        p.wal.push(Parent.wallets[i].currency);
                        if (Parent.wallets[i].primary === true) {
                            if (Parent.wallets[i].currency !== txcur) {
                                var rate = yield Rate.findOne({source : txcur, destination : Parent.wallets[i].currency}).exec();
                                var rateRev = yield Rate.findOne({source : Parent.wallets[i].currency, destination : txcur}).exec();
                                var rateFromUSD = yield Rate.findOne({source : 'USD', destination : Parent.wallets[i].currency}).exec();
                                var rateToUSD = yield Rate.findOne({source : 'USD', destination : txcur}).exec();
                                if (rate !== null) {
                                    Parent.wallets[i].balance += (txamt * parseFloat(rate.rate))
                                    p.cAmt = (txamt * parseFloat(rate.rate))
                                    p.cCur = Parent.wallets[i].currency;
                                    fsu = true;
                                } else if (rateRev !== null) {
                                    Parent.wallets[i].balance += (txamt / parseFloat(rateRev.rate))
                                    p.cAmt = (txamt / parseFloat(rate.rate))
                                    p.cCur = Parent.wallets[i].currency;
                                    fsu = true;
                                } else if ((rateFromUSD !== null) && (rateToUSD !== null)) {
                                    var s1 = (txamt / parseFloat(rateToUSD.rate));
                                    var s2 = (s1 * parseFloat(rateFromUSD.rate));
                                    p.cAmt = s2;
                                    Parent.wallets[i].balance += s2;
                                    p.cCur = Parent.wallets[i].currency;
                                    fsu = true;
                                } else {
                                    fsu = false;
                                    var err = {};
                                    err.code = "INCOMPATIBLE_UPSTREAM_WALLET";
                                    err.message = "We could not process this transaction because there is no rate between " + txcur + " and " + Parent.wallets[i].currency + ".Please contact support"
                                    err.status = 500;
                                    return reject(err);
                                }
                            } else {
                                Parent.wallets[i].balance += txamt;
                                fsu = true;
                            }
                        }
                    }
                }
                if (fsu) {
                    var par = yield Parent.save();
                    var tx1 = new Transaction();
                        tx1.account = Parent._id;
                        tx1.time = new Date()
                        tx1.type = 'crd';
                        tx1.amount = p.cAmt;
                        tx1.currency = p.cCur;
                        tx1.description = "Affilliate commission for Topup ref : " + Tl.operator_reference
                        tx1.source = 'Affiliate system'
                        var t1 = yield tx1.save();
                        var Grandpa = yield Account.findOne({_id : Parent.parent}).exec();
                        if (Grandpa !== null) {
                            if (Grandpa.type !== 'wholesaler') {
                                var err = {}
                                err.code = "EDB_FAILURE"
                                err.message = "Expecting wholesaler got " + Grandpa.type + " instead" 
                                err.status = 500;
                                return reject(err);
                                                   } else {
                                                       //ok there

                                                       var txamt = ((parseFloat(Tl.paid_amount) * pmap.resProfit) / 100);
                                                       var txcur = Tl.paid_currency;
                var fsx = false;
                var fsb = true;
                for (i=0; i <= Grandpa.wallets.length; i++) {
                    if (Grandpa.wallets[i].currency == txcur) {
                        fsx = true;
                        Grandpa.wallets[i].balance += txamt;
                        p.cAmt = txamt;
                        p.cCur = txcur;
                    }
                }
                if (!fsx) {
                    p.wal = [];
                    for (i=0; i < Grandpa.wallets.length; i++) {
                        p.wal.push(Grandpa.wallets[i].currency);
                        if (Grandpa.wallets[i].primary === true) {
                            if (Grandpa.wallets[i].currency !== txcur) {
                                var rate = yield Rate.findOne({source : txcur, destination : Grandpa.wallets[i].currency}).exec();
                                var rateRev = yield Rate.findOne({destination : txcur, source : Grandpa.wallets[i].currency}).exec();
                                var rateFromUSD = yield Rate.findOne({source : 'USD', destination : Grandpa.wallets[i].currency}).exec();
                                var rateToUSD = yield Rate.findOne({source : 'USD', destination : txcur}).exec();
                                if (rate !== null) {
                                    Grandpa.wallets[i].balance += (txamt * parseFloat(rate.rate))
                                    p.cAmt = (txamt * parseFloat(rate.rate))
                                    p.cCur = Grandpa.wallets[i].currency;
                                    fsx = true;
                                } else if (rateRev !== null) {
                                     Grandpa.wallets[i].balance += (txamt / parseFloat(rateRev.rate))
                                    p.cAmt = (txamt / parseFloat(rate.rate))
                                    p.cCur = Grandpa.wallets[i].currency;
                                    fsx = true;

                                     } else if ((rateFromUSD !== null) && (rateToUSD !== null)) {
                                    var s1 = (txamt / parseFloat(rateToUSD.rate));
                                    var s2 = (s1 * parseFloat(rateFromUSD.rate));
                                    p.cAmt = s2;
                                    Grandpa.wallets[i].balance += s2;
                                    p.cCur = Grandpa.wallets[i].currency;
                                    fsx = true;
                                } else {
                                    fsx = false;
                                    var err = {};
                                    err.code = "INCOMPATIBLE_UPSTREAM_WALLET";
                                    err.message = "We could not process this transaction because there is no rate between " + txcur + " and " + Grandpa.wallets[i].currency + ".Please contact support"
                                    err.status = 500;
                                    return reject(err);
                                }
                            } else {
                                Grandpa.wallets[i].balance += txamt;
                                fsx = true;
                            }
                        }
                    }
                }
                if (fsx) {
                    var gpar = yield Grandpa.save();
                    var tx2 = new Transaction();
                        tx2.account = Grandpa._id;
                        tx2.time = new Date()
                        tx2.type = 'crd'
                        tx2.amount = p.cAmt
                        tx2.currency = p.cCur
                        tx2.description = "Affilliate commission for Topup ref : " + Tl.operator_reference
                        tx2.source = 'Affiliate system'
                        var t2 = yield tx2.save();
                        Tl.related_transactions.push(t1._id)
                        Tl.related_transactions.push(t2._id);
                        var Tf = Tl.save();
                        resolve(Tf);
                }


                                                   }
                        } else {
                            var err = {};
                            err.code = "EDB_FAILURE";
                            err.message = "wholesaler is null";
                            err.status = 500;
                            return reject(err)
                        }
                }
            } else if (Parent.type == 'wholesaler') {
                var txamt = ((parseFloat(Tl.paid_amount) * pmap.agentProfit) / 100);
                var txcur = Tl.paid_currency;
                var fsu = false;
                var fsb = true;
                for (i=0; i < Parent.wallets.length; i++) {
                    if (Parent.wallets[i].currency == txcur) {
                        fsu = true;
                        Parent.wallets[i].balance += txamt;
                        p.cAmt = txamt;
                        p.cCur = txcur;
                    }
                }
                if (!fsu) {
                    p.wal = [];
                    for (i=0; i < Parent.wallets.length; i++) {
                        p.wal.push(Parent.wallets[i].currency);
                        if (Parent.wallets[i].primary === true) {
                            if (Parent.wallets[i].currency !== txcur) {
                                var rate = yield Rate.findOne({source : txcur, destination : Parent.wallets[i].currency}).exec();
                                var rateRev = yield Rate.findOne({destination : txcur, source : Parent.wallets[i].currency}).exec();
                                 var rateFromUSD = yield Rate.findOne({source : 'USD', destination : Parent.wallets[i].currency}).exec();
                                var rateToUSD = yield Rate.findOne({source : 'USD', destination : txcur}).exec();
                                if (rate !== null) {
                                    Parent.wallets[i].balance += (txamt * parseFloat(rate.rate))
                                    p.cAmt = (txamt * parseFloat(rate.rate))
                                    p.cCur = Parent.wallets[i].currency;
                                    fsu = true;
                                } else if (rateRev !== null) {
                                    Parent.wallets[i].balance += (txamt / parseFloat(rateRev.rate))
                                    p.cAmt = (txamt / parseFloat(rateRev.rate))
                                    p.cCur = Parent.wallets[i].currency;
                                    fsu = true;
                                    } else if ((rateFromUSD !== null) && (rateToUSD !== null)) {
                                    var s1 = (txamt / parseFloat(rateToUSD.rate));
                                    var s2 = (s1 * parseFloat(rateFromUSD.rate));
                                    p.cAmt = s2;
                                    Parent.wallets[i].balance += s2;
                                    p.cCur = Parent.wallets[i].currency;
                                    fsu = true;
                                } else {
                                    fsu = false;
                                    var err = {};
                                    err.code = "INCOMPATIBLE_UPSTREAM_WALLET";
                                    err.message = "We could not process this transaction because there is no rate between " + txcur + " and " + Parent.wallets[i].currency + ".Please contact support"
                                    err.status = 500;
                                    return reject(err);
                                }
                            } else {
                                Parent.wallets[i].balance += txamt;
                                fsu = true;
                            }
                        }
                    }
                }
                if (fsu) {
                    var par = yield Parent.save();
                    var tx1 = new Transaction();
                        tx1.account = Parent._id;
                        tx1.time = new Date()
                        tx1.type = 'crd';
                        tx1.amount = p.cAmt;
                        tx1.currency = p.cCur;
                        tx1.description = "Affilliate commission for Topup ref : " + Tl.operator_reference
                        tx1.source = 'Affiliate system'
                        var t1 = yield tx1.save();
                        Tl.related_transactions.push(t1._id);
                        var Tf = yield Tl.save();
                        resolve(Tf);
                }
            } else {
                //parent unknown or null
                var err = {};
                err.code = "EDB_FAILURE"
                err.message = "Somthing is wrong, we cannot find the parent account"
                err.status = 500;

                }


        }).catch(function (err) {
                
          return reject(err);
        })
    })
}
app.transferFunds = function (a, b, o) {
return new Promise(function (resolve, reject) {
        co(function* () {
            var AccA = yield Account.findOne({'wallets.wallet_id' : a}).exec();
            var AccB = yield Account.findOne({'wallets.wallet_id' : b}).exec();
            var sourceWallet = false;
            var destWallet = false;

            /*
            o.amount in source currency
            o.description -> description / reference of transfer
            */
            if ( (AccA !== null) && (AccB !== null) ) {
                //first sweep 
                AccA.wallets.forEach(function (w) {
                    if (w.wallet_id == a) {
                        sourceWallet = w;
                    }
                })
                AccB.wallets.forEach(function (w) {
                    if (w.wallet_id == b) {
                        destWallet = w;
                    }
                })
                if (sourceWallet && destWallet) {
                    if (sourceWallet.currency == destWallet.currency) {
                        //we have simple direct transfer 
                        var nbA = parseFloat(sourceWallet.balance) - parseFloat(Math.abs(o.amount));
                        if (nbA >= 0) {
                            //get on with it 
                            for (x=0;x < AccA.wallets.length; x++) {
                                var w = AccA.wallets[x];
                                if (w.wallet_id == sourceWallet.wallet_id) {
                                    w.balance = nbA;
                                }
                            }
                            var xA = yield AccA.save();
                            var  tx = new Transaction();
                                tx.account = AccA._id;
                                tx.type = 'deb';
                                tx.amount = Math.abs(o.amount)
                                tx.currency = sourceWallet.currency;
                                tx.time = new Date()
                                tx.description = o.description;
                                tx.source = "Balance transfer from " + a + " to " + b;
                                var txA = yield tx.save();
                                for (y=0;y < AccB.wallets.length; y++) {
                                    var w = AccB.wallets[y];
                                    if (w.wallet_id == destWallet.wallet_id) {
                                        w.balance += parseFloat(o.amount);
                                    }
                                }
                                var xB = yield AccB.save();
                                var ty = new Transaction();
                                ty.account = AccB._id;
                                ty.type = 'crd'
                                ty.amount = Math.abs(o.amount)
                                ty.currency = destWallet.currency;
                                ty.time = new Date();
                                ty.description = o.description;
                                ty.source = "Balance transfer from " + a + " ( "+ AccA.account_name + ") to " + b;
                                var txB = yield ty.save();
                                resolve();
                                
                        } else {
                            var err = {}
                                err.code = "INSUFFICIENT_FUNDS";
                                err.message = "Your wallet " + a + " does not have balance necessary to perform this transaction"
                                err.status = 402;
                                return reject(err);
                        }
                    } else {
                        //we need to make rate 
                        var rate = yield Rate.findOne({source : sourceWallet.currency, destination : destWallet.currency}).exec();
                        var rateRev = yield Rate.findOne({destination : sourceWallet.currency, source : destWallet.currency}).exec();
                         var rateFromUSD = yield Rate.findOne({source : 'USD', destination : sourceWallet.currency}).exec();
                                var rateToUSD = yield Rate.findOne({source : 'USD', destination : destWallet.currency}).exec();
                        if (rate !== null) {
                            var nbA = parseFloat(sourceWallet.balance) - parseFloat(Math.abs(o.amount));
                            var nbB = parseFloat(Math.abs(o.amount)) * parseFloat(rate.rate);
                            console.log('NBA/NBB', nbA, nbB, rate)
                        if (nbA >= 0) {
                            //get on with it 
                            for (x=0;x < AccA.wallets.length; x++) {
                                var w = AccA.wallets[x];
                                if (w.wallet_id == sourceWallet.wallet_id) {
                                    w.balance = nbA;
                                }
                            }
                            var xA = yield AccA.save();
                            var  tx = new Transaction();
                                tx.account = AccA._id;
                                tx.type = 'deb';
                                tx.amount = Math.abs(o.amount);
                                tx.currency = sourceWallet.currency;
                                tx.time = new Date()
                                tx.description = o.description;
                                tx.source = "Balance transfer from " + a + " to " + b;
                                var txA = yield tx.save();
                                for (y=0;y < AccB.wallets.length; y++) {
                                    var w = AccB.wallets[y];
                                    if (w.wallet_id == destWallet.wallet_id) {

                                        w.balance += nbB;
                                    }
                                }
                                var xB = yield AccB.save();
                                var ty = new Transaction();
                                ty.account = AccB._id;
                                ty.type = 'crd'
                                ty.amount = nbB;
                                ty.currency = destWallet.currency;
                                ty.time = new Date();
                                ty.description = o.description;
                                ty.source = "Balance transfer from " + a + " ( "+ AccA.account_name + ") to " + b;
                                var txB = yield ty.save();
                                resolve();
                        } else {
                              var err = {}
                                err.code = "INSUFFICIENT_FUNDS";
                                err.message = "Your wallet " + a + " does not have balance necessary to perform this transaction"
                                err.status = 402;
                                return reject(err);
                        }
                        } else if (rateRev !== null) { 
                             var nbA = parseFloat(sourceWallet.balance) - parseFloat(Math.abs(o.amount));
                            var nbB = parseFloat(Math.abs(o.amount)) / parseFloat(rateRev.rate);
                            
                            console.log('NBA/NBB', nbA, nbB, rate)
                        if (nbA >= 0) {
                            //get on with it 
                            for (x=0;x < AccA.wallets.length; x++) {
                                var w = AccA.wallets[x];
                                if (w.wallet_id == sourceWallet.wallet_id) {
                                    w.balance = nbA;
                                }
                            }
                            var xA = yield AccA.save();
                            var  tx = new Transaction();
                                tx.account = AccA._id;
                                tx.type = 'deb';
                                tx.amount = Math.abs(o.amount)
                                tx.currency = sourceWallet.currency;
                                tx.time = new Date()
                                tx.description = o.description;
                                tx.source = "Balance transfer from " + a + " to " + b;
                                var txA = yield tx.save();
                                for (y=0;y < AccB.wallets.length; y++) {
                                    var w = AccB.wallets[y];
                                    if (w.wallet_id == destWallet.wallet_id) {

                                        w.balance += nbB;
                                    }
                                }
                                var xB = yield AccB.save();
                                var ty = new Transaction();
                                ty.account = AccB._id;
                                ty.type = 'crd'
                                ty.amount = nbB;
                                ty.currency = destWallet.currency;
                                ty.time = new Date();
                                ty.description = o.description;
                                ty.source = "Balance transfer from " + a + " ( "+ AccA.account_name + ") to " + b;
                                var txB = yield ty.save();
                                resolve();
                        } else {
                              var err = {}
                                err.code = "INSUFFICIENT_FUNDS";
                                err.message = "Your wallet " + a + " does not have balance necessary to perform this transaction"
                                err.status = 402;
                                return reject(err);
                        }
                    } else if ((rateFromUSD !== null) && (rateToUSD !== null)) {
                         var nbA = parseFloat(sourceWallet.balance) - parseFloat(Math.abs(o.amount));
                            var nbB1 = parseFloat(Math.abs(o.amount)) / parseFloat(rateFromUSD.rate);
                            var nbB2 = parseFloat(nbB1) * parseFloat(rateToUSD.rate)
                        if (nbA >= 0) {
                            //get on with it 
                            for (x=0;x < AccA.wallets.length; x++) {
                                var w = AccA.wallets[x];
                                if (w.wallet_id == sourceWallet.wallet_id) {
                                    w.balance = nbA;
                                }
                            }
                            var xA = yield AccA.save();
                            var  tx = new Transaction();
                                tx.account = AccA._id;
                                tx.type = 'deb';
                                tx.amount =Math.abs(o.amount);
                                tx.currency = sourceWallet.currency;
                                tx.time = new Date()
                                tx.description = o.description;
                                tx.source = "Balance transfer from " + a + " to " + b;
                                var txA = yield tx.save();
                                for (y=0;y < AccB.wallets.length; y++) {
                                    var w = AccB.wallets[y];
                                    if (w.wallet_id == destWallet.wallet_id) {

                                        w.balance += nbB2;
                                    }
                                }
                                var xB = yield AccB.save();
                                var ty = new Transaction();
                                ty.account = AccB._id;
                                ty.type = 'crd'
                                ty.amount = nbB2;
                                ty.currency = destWallet.currency;
                                ty.time = new Date();
                                ty.description = o.description;
                                ty.source = "Balance transfer from " + a + " ( "+ AccA.account_name + ") to " + b;
                                var txB = yield ty.save();
                                resolve();
                        } else {
                              var err = {}
                                err.code = "INSUFFICIENT_FUNDS";
                                err.message = "Your wallet " + a + " does not have balance necessary to perform this transaction"
                                err.status = 402;
                                return reject(err);
                        }
                        } else {
                            var err = {};
                            err.code = "CUR_XCH_FAILURE";
                            err.message = "Sorry, we do not support Currency exchange between : " + sourceWallet.currency + " and  : " + destWallet.currency + " , please contact support";
                            err.status = 500;
                            return reject(err);
                        }

                    }
                }
            } else {
                var err = {}
                err.code = "EDB_FAILURE"
                err.message = "Could not find source or destination wallets, please contact support";
                err.status = 500
            }


        }).catch(function (err) {
          return reject(err);
        })
    })
}

module.exports = app;