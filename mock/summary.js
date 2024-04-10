require('dotenv').config({path : '/usr/local/coreapi/.env'});
const ApiBalance = require('../models/apibalance');
const TagStockSummary = require('../models/tagstocksummary');
(async () => {
	
    var a1 = await ApiBalance.find({code : {$ne : 'NGMT'}});
    for (var i = 0; i < a1.length ; i++) {
        var r = a1[i];
	console.log(r.code,r.subcode,r.balance);
        await TagStockSummary.findOneAndUpdate({code : r.code, subcode : r.subcode, tag : r.tag}, {code : r.code, subcode : r.subcode, tag : r.tag, balance : r.balance, currency : r.currency, lastCheck : new Date()}, {upsert : true}).exec()
	//console.log(x1)
        /*
        var t1 = new TagStockSummary();
        t1.code = r.code;
        t1.subcode = r.subcode;
        t1.credential = r.credential;
        t1.balance = r.balance;
        t1.currency = r.currency;
        t1.tag = r.tag;
        t1.lastCheck = r.lastCheck;
        var xa = await t1.save();
        */
    }
/*
    var am0 = 0;
    var a2 = await ApiBalance.find({code : 'NGMT', tag : 'IDEMS'});
    for (var i = 0; i < a2.length ; i++) {
        var x = a2[i];
        am0 += x.balance;
    }
    var xa = a2[0];
    await TagStockSummary.findOneAndUpdate({code : xa.code, subcode : 'MULTI', tag : 'MFIN'}, {code : xa.code, subcode : 'MULTI', tag : 'MFIN', balance : am0, currency : xa.currency, lastCheck : new Date()}, {upsert : true}).exec()
*/  
  var am1 = 0;
    var a3 = await ApiBalance.find({code : 'NGMT', tag : 'RINGO'});
    for (var i = 0; i < a3.length ; i++) {
        var x = a3[i];
        am1 += x.balance;
    }
    var xa = a3[0];
	console.log('MTN', am1);
    await TagStockSummary.findOneAndUpdate({code : xa.code, subcode : 'MULTI', tag : 'RINGO'}, {code : xa.code, subcode : 'MULTI', tag : 'RINGO', balance : am1, currency : xa.currency, lastCheck : new Date()}, {upsert : true}).exec()
    
})();
setTimeout(() => {
    process.exit(0);
}, 20000)
