/* 
* /v1/accounts - module
* Author : Konstantins Kolcovs
* (c) 2016, OK Media Group LTD.
* File : accounts.js
*/ 

var express = require('express');
var User = require('../models/user');
var Account = require('../models/account');
var Apiacc = require('../models/apiaccount');
var Operator = require('../models/operator');
var Pinbatch = require('../models/pinbatch');
var Pindb = require('../models/pindb');
var Product = require('../models/product');
var Ticket = require('../models/ticket');
var Ticketmsg = require('../models/ticketmsg');
var AccountRoute = require('../models/accountroute');
var DynamicRoute = require('../models/dynamicroute');
var DynamicRule = require('../models/linkrule');
var FinancialRule = require('../models/routingrule');
var Topuplog = require('../models/topuplog');
var Transaction = require('../models/transaction');
var CountryHelper = require('../models/countryhelper')
var ProvHelper = require('../models/provhelper')
var Rate = require('../models/rate')
var Acl = require('../models/acl')
var ProfitMap = require('../models/profitmap')
var FixedProfitMap = require('../models/fixedprofitmap');
var Apicred = require('../models/apicred');
var jwt = require('jwt-simple');
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var moment = require('moment');
var router = express.Router();
var authc = require('../modules/auth');
var oid = require('mongoose').Types.ObjectId;
var c = require('../modules/checks');
var authc = require('../modules/auth');
var Finance = require('../modules/finance')
var co = require('co');
var cs = require('co-stream');
var parallel = require('co-parallel')
var Baseprod = require('../models/baseprod')
var NumLookup = require('../modules/locnumberlookup')
var multer  = require('multer')
var crypto = require('crypto')
var mime = require('mime')
var Cache = require('../modules/cache');
var Promo = require('../models/promo')
var md5 = require('md5');
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/images/')
  },
  filename: function (req, file, cb) {
    crypto.pseudoRandomBytes(16, function (err, raw) {
      cb(null, raw.toString('hex') + Date.now() + '.' + mime.extension(file.mimetype));
    });
  }
})
function randomIntFromInterval(min,max)
{
    return Math.floor(Math.random()*(max-min+1)+min);
}
var upload = multer({ storage: storage })
console.log('API account route start ', new Date().getTime());
//Get Accounts
router.get('/', async function (req, res) {
    var a = await Cache.get('aclist');
    if (a !== false) {
        res.json(a);
    } else {
        Account.find({_id : {$ne : req.user.main_account}}).sort({account_name : 1}).exec()
        .then(async function (accounts) {
            var accs = [];
            accounts.forEach(function (fr) {
                var o = fr.toObject();
                o.parent_name = req.user.rwnames[fr.parent];
                accs.push(o);
            })
            var resp = {};
            resp.count = accounts.length;
            resp.accounts = accs;
            await Cache.set('aclist', resp, 120);
            res.json(resp);
        })
        .catch(function (err) {
            err.code = 'EDB_ERROR';
            err.status = 500;
            throw err;
        })
    }
   
});
router.post('/ajaxSearch', (req,res) => {
    if (isNaN(req.body.query)) {
        var re = new RegExp(req.body.query, 'i');
        var myOr = {account_name : re};
       
    } else {
        var myOr = {numeric_id : req.body.query}
    }
            var ob = {};
            
           
             
    if (req.query.fields) {
        var li = req.query.fields.split(',');
        li.forEach((l) => {
            ob[l] = true;
        })
    }
    console.log('AA', myOr, ob);
    Account.find(myOr, ob)
        .then((acc) => {
            var r = {
                accounts : acc,
                count : acc.length
            }
            res.json(r);
        })
        .catch((err) =>  {console.log(err); res.sendStatus(500) })
     
})
//Account Names
router.get('/names', async (req,res) => {
    //try cache first
    console.log('API account names start ', new Date().getTime());
    var a = await Cache.get('acnames');
    console.log('API account names read cache ', new Date().getTime());
    console.log(a, typeof a, );
    if (a !== false) {
        console.log('FFF', new Date().getTime());
        res.json(a)
    } else {
        var r = await Account.find({}, {account_name : true, type : true}).exec();
        console.log('AR', new Date().getTime());
        await Cache.set('acnames', r, 3600);
        res.json(r);
    }
   
})
router.get('/names/count', async (req,res) => {
    var a = await Cache.get('acnames');
    if (a !== false) {
        var cc = a.length;
    } else {
       var cc = 0;
    }
    var r = await Account.find({}, {account_name : true, type : true}).count().exec();
    if (cc !== r) {
        console.log('CC, R', cc, r);
        //trigger cache update
        var rx = await Account.find({}, {account_name : true, type : true}).exec();
        await Cache.set('acnames', rx, 3600);
    }
    res.json({count : r});
})
//Account Names
router.get('/wholesalers', async function (req,res) {
    var r = await Account.find({type : 'wholesaler'});
    res.json({count : r.length, accounts : r});
})
router.get('/numeric/:id', async function (req, res) {
    //await dhmc._busy();
    //var hk = 'acc-' + req.params.id;
    //var rq = await cache.get(hk);
    //if ((rq !== null ) || rq) {
     //   res.json(JSON.parse(rq)); 
   // } else {

        Account.findOne({numeric_id : req.params.id}).exec()
            .then(function (acc) {
               // cache.set(hk, JSON.stringify(acc), 900);
                //dhmc._ready();
                res.json(acc);
            })
            .catch(function (err) {
                dhmc._ready();
                err.status = 500;
                err.code = 'EDB_ERROR';
                throw err;
            })
       
   // }
    
        
});
//Account Pagination
router.get('/page/:page', function (req, res) {

    var ob = {};
    if (req.query.fields) {
        var li = req.query.fields.split(',');
        li.forEach((l) => {
            ob[l] = true;
        })
    }
    var opts = {page : req.params.page, limit : 50, sort : {account_name : 1}, select : ob};
    Account.paginate({}, opts)
        .then(function (f) {
		var docs = [];
             var o = {};
            o.count = f.total;
            o.pages = f.pages;
            o.page = f.page;
            o.limit = f.limit;
            o.docs = f.docs;
            res.json(o);
        })
        .catch(function (err) {
                    res.status = err.status || 500;
                    console.log(err);
                    res.json(err.status, err);
                    });
})
router.post('/page/:page', function (req, res) {
   // var q = new RegExp(req.body.query, 'i');
    //var qu = {$or : [{first_name : q}, {last_name : q}, {company_name : q}, {phone : q}, {email : q}, {'address.line1' : q}, {'address.city' : q}, {'address.county' : 1}, {'address.postcode' : 1}]}
    
    if (!isNaN(req.body.query)) {
        var myOr = {numeric_id : req.body.query}
    } else {
       // var qu = {$text : {$search : req.body.query} }
       var re = new RegExp(req.body.query, 'i');
       var myOr = {account_name : re};
    }
    if (req.body.query == '') {
        var myOr = {};
    }
    var ob = {};
    if (req.query.fields) {
        var li = req.query.fields.split(',');
        li.forEach((l) => {
            ob[l] = true;
        })
    }
    var opts = {page : req.params.page, limit : 50, sort : {account_name :  1}, select : ob};
    Account.paginate(myOr, opts)
        .then(function (f) {
		var docs = [];
             var o = {};
            o.count = f.total;
            o.pages = f.pages;
            o.page = f.page;
            o.limit = f.limit;
            o.docs = f.docs;
            res.json(o);
        })
        .catch(function (err) {
                 
                    console.log(new Error(err.message));
                    res.status(err.status || 500).send(err)
                    });
})
//Account Pagination
//Create Account
router.post('/', function (req, res) {
    //check for mandatory fields
    if (!req.body.account_name || !req.body.legal_type) {
                    var err = {};
                    err.code = 'EMISSING_REQUIRED';
                    err.message = 'You have not supplied required fields!';
                    err.status = 418;
                    throw err;
    }
       Account.findOne({account_name : req.body.account_name})
    .then(function (accheck) {
        if (accheck !== null) {
            var err = {};
            err.message = 'Account already exists!';
            err.status = 409;
            throw err;
        } else {
            var bodycheck;
            var parent;
            var manager;
            var legal = ['individual', 'company'];
            //creating account
           bodycheck = req.body.type || 'wholesaler';
            parent = req.user.main_account;
            if (legal.contains(req.body.legal_type)) {

            } else {
                var err = {};
                    err.code = 'EUNSUP_ELEMENT_VALUE';
                    err.message = 'We dont support such legal_type';
                    err.status = 405;
                    throw err;
            }
            var ac = new Account();
                ac.account_name = req.body.account_name;
                ac.type = bodycheck;
                if (ac.type == 'wholesaler') {
                    ac.permitted_apis = req.body.permitted_apis;
                }
                ac.parent = parent;
	        var cur = req.body.currency || 'USD';
        	var wa = {
                    wallet_name : cur + " Wallet",
                    wallet_id : cur + randomIntFromInterval(10000000, 99999999),
                    primary : true,
                    currency : cur,
                    balance : 0,
                    active : true,
                    virtual : false,
                    parent_wallet : null
                }
                ac.wallets.push(wa);
		ac.test_mode = req.body.test_mode || false;
		ac.sms_cost = req.body.sms_cost || 0.1;
         ac.canEditOwnAcl = req.body.canEditOwnAcl || true;
                ac.numeric_id = randomIntFromInterval(10000000, 99999999);
                for (var key in req.body) {
                    if ((key == 'parent') || (key == 'balance') || (key == 'permitted_apis') || (key == 'currency'))
                        continue;
                    ac[key] = req.body[key];
                }
                console.log('ACCPROT', ac);
                return ac.save();

        }
    })
    .then(function (a) {
        res.locals.a = a;
         var pmap = {
            active : true,
            time : new Date(),
            maps : [
                {
                    code : 'ALL:ALL',
                    profit_pct : res.locals.pct || 0,
                    active : true,
                    time : new Date()
                }
            ]
        }

        var pm = new ProfitMap(pmap)
        
        return pm.save();
    })
     .then(function (pm) {
        res.locals.pm = pm; 
        var fpmap = {
            active : true,
            time : new Date(),
            maps : [
                {
                    code : 'ALL:ALL',
                    currency : 'NGN',
                    rate : 1,
                    min_threshold_day : 0,
                    min_threshold_month : 0,
                    profit : 0,
                    active : true,
                    time : new Date()
                },
                {
                    code : 'NG:FT',
                    currency : 'NGN',
                    rate : 1,
                    min_threshold_day : 0,
                    min_threshold_month : 0,
                    profit : 0,
                    active : true,
                    time : new Date()
                }
            ]
        }
        var fpm = new FixedProfitMap(fpmap);
        return fpm.save();
        //
    })
    .then(function (px) {
        res.locals.fpm = px;
        return Account.findOne({_id : res.locals.a._id}).exec();
    })
    .then(function (pa) {
        pa.profit_map = res.locals.pm._id;
        pa.profit_map_fixed = res.locals.fpm; 
        return pa.save();
    })
    .then(function (pz) {
        res.status(201).send(pz);
    })
    .catch(function (err) {
        console.log(new Error(err.message));
        res.status(err.status || 500).send(err)
    })
});

router.all('/', function (req, res) {
    var err = {};
    err.message = 'Unsupported method';
    err.status = 405;
    err.code = 'EUNSUP_METHOD';
    throw err;
});
//Get Account
router.get('/:id/promo', c.checkReadAccess, async function (req,res) {
    var x = await Promo.find({account : req.params.id});
    res.json({count : x.length, promos : x});
    })
    router.get('/:id/promo/:pid', c.checkReadAccess, async function (req,res) {
        var x = await Promo.findOne({account : req.params.id, _id : req.params.pid});
        if (x !== null) {
            res.json(x);
        } else {
            res.sendStatus(404);
        }
        
    })
    router.post('/:id/promo', c.checkWriteAccess, async function (req,res) {
        console.log('Body', req.body);
        /*
          account : Schema.Types.ObjectId,
      promo_name : String,
      description : String,
      active : Boolean,
      date_start : Date,
      date_end : Date,
      reward_mode : {type : String, enum : ['pct', 'fix']},
      trigger_mode : {type : String, enum : ['single', 'multiple']},
      threshold : Number,
      reward_amt : Number,
      scope : {type : String, enum : ['all', 'operator', 'list']},
      operator : String,
      list : [],
      send_sms : Boolean,
      sms_text : String,
      reward_count : Number,
      reward_payout : Number,
      currency : String,
      topup_total_amount : Number,
        */
       var x1 = new Promo({
           account : req.params.id,
           promo_name : req.body.promo_name,
           description : req.body.description,
           active : true,
           date_start : new Date(req.body.date_start),
           date_end : new Date(req.body.date_end),
           reward_mode : req.body.reward_mode,
           trigger_mode : req.body.trigger_mode,
           threshold : req.body.threshold,
           reward_amt : req.body.reward_amt,
           scope : req.body.scope,
           send_sms : req.body.send_sms,
           sms_text : req.body.sms_text,
           reward_count : 0,
           reward_payout : 0,
           currency : 'NGN',
           topup_total_amount : 0
       });
       if (req.body.scope == 'operator') {
           x1.operator = req.body.operator;
       } else if (req.body.scope == 'list') {
        if (req.body.numbers.constructor === Array) {
            x1.list = req.body.numbers;
           
        } else {
            x1.list = req.body.numbers.split(',');
        }
       }
    var xx = await x1.save();
    res.status(201).send(xx);
    })
    router.put('/:id/promo/:pid', c.checkWriteAccess, async function (req,res) {
        var xx = await Promo.findOne({account : req.params.id, _id : req.params.pid});
        for (var key in req.body) {
            var forbiddenKeys = ['whitelabel_opts.portal_url', 'whitelabel_opts.portal_logo', 'whitelabel_opts.portal_favicon', 'audit', 'rwaccess', 'wallets','roaccess', '_id', 'hasSystemAccess', 'createdAt', 'updatedAt', '__v', 'parent', 'profit_map', 'acl', 'permitted_apis'];
            if (forbiddenKeys.contains(key))
                 continue;
            xx[key] = req.body[key];
        }
         var xb = await xx.save();
         res.json(xb);
    })
    router.delete('/:id/promo/:pid', c.checkWriteAccess, async function (req,res) {
        await Promo.findOne({account : req.params.id, _id : req.params.pid}).remove();
        res.sendStatus(204);
    })
router.get('/all', function (req, res) {
    Account.find({_id : {$in : req.user.child}}, {_id : true, account_name : true, active : true, type : true, legal_type : true, numeric_id : true}).exec()
    .then(function (accounts) {
        var resp = {};
        resp.count = accounts.length;
        resp.accounts = accounts;
       
        res.json(resp);
    })
    .catch(function (err) {
        err.code = 'EDB_ERROR';
        err.status = 500;
        throw err;
    })
});
router.get('/:id', function (req, res) {
        Account.findOne({_id : req.params.id}).exec()
        .then(function (acc) {
            res.json(acc);
        })
        .catch(function (err) {
            err.status = 500;
            err.code = 'EDB_ERROR';
            throw err;
        })
});
router.get('/accountlist', async  function (req, res) {
    var x = await Account.find().exec();
    res.json(x);
});

router.post('/accountlist', async  function (req, res) {
    // console.log("sdfsdfsdfsdf");
    // console.log(typeof req.body);
    // console.log(req.body, md5(req.body));
    // console.log('BLEn', Object.keys(req.body).length);
    var items = req.body;
    var numItems = items.length;
    var itemHash = md5(items);

    if (numItems > 0) {
        var a = await Cache.get('al_' + itemHash);

        if (a !== false) {
            res.json(a);
        } else {
            Account.find({'_id' :{$in:items}}).exec()
            .then(async function (accs) {
                await Cache.set('al_' + itemHash, accs, 900);
                res.json(accs);
            })
            .catch(function (err) {
                err.status = 500;
                err.code = 'EDB_ERROR';
                throw err;
            })
        }
    } else {
        res.sendStatus(404);
    }
    
    //Account.find({_id :{$in : req.body}}).exec()
   
});
router.get('/:id/wallets', c.checkReadAccess, function (req, res) {
    Account.findOne({_id : req.params.id})
        .then(function (acc) {
            var re = {};
            re.count = acc.wallets.length;
            re.wallets = acc.wallets;
            res.json(re);
        })
        .catch(function (err) {
            err.status = 500;
            err.code = 'EDB_ERROR';
            throw err;
        })
})
router.get('/:id/wallets/:wallet', c.checkReadAccess, function (req, res) {
    Account.findOne({_id : req.params.id})
        .then(function (acc) {
            res.json(acc.wallets.id(req.params.wallet));
        })
        .catch(function (err) {
            err.status = 500;
            err.code = 'EDB_ERROR';
            throw err;
        })
})
router.get('/:id/vwallets', c.checkReadAccess, function (req, res) {
    Account.findOne({_id : req.params.id})
        .then(function (acc) {
            var re = {};
            re.count = acc.wallets.length;
            re.virtual_wallets = acc.virtual_wallets;
            res.json(re);
        })
        .catch(function (err) {
            err.status = 500;
            err.code = 'EDB_ERROR';
            throw err;
        })
})
router.get('/:id/vwallets/:wallet', c.checkReadAccess, function (req, res) {
    Account.findOne({_id : req.params.id})
        .then(function (acc) {
            res.json(acc.virtual_wallets.id(req.params.wallet));
        })
        .catch(function (err) {
            err.status = 500;
            err.code = 'EDB_ERROR';
            throw err;
        })
})
router.post('/:id/wallets', c.checkWriteAccess, function (req, res) {
    if (!req.body.currency) {
                    var err = {};
                    err.code = 'EMISSING_REQUIRED';
                    err.message = 'You have not supplied required fields!';
                    err.status = 418;
                    throw err;
            }
            Account.findOne({_id : req.params.id})
                .then(function (acc) {
                    //check for wallet existence
                    acc.wallets.forEach(function (wa) {
                        if (wa.currency == req.body.currency) {
                            var err = {};
                            err.code = "DUPLICATE_WALLET"
                            err.message = "Wallet of this currency already exists!"
                            err.status = 403;
                            throw err;
                        }
                    })
                    return Rate.findOne({destination : req.body.currency, source : "USD"}).exec()
                })
                .then(function (ra) {
                    if (ra !== null) {
                        return Account.findOne({_id : req.params.id}).exec();
                    } else {
                        var err = {};
                        err.code = "UNSUPORTED_CURRENCY"
                        err.message = "Sorry, this currency is not yet supported, please contact support";
                        err.status = 403;
                        throw err;
                    }
                })
                .then(function (ac) {
                    var myWalletId = randomIntFromInterval(10000000,99999999);
                    var wa = {
                        wallet_name : req.body.wallet_name || req.body.currency + ' Wallet',
                        wallet_id : req.body.currency + myWalletId,
                        balance : 0,
                        primary : false,
                        virtual : false,
                        primary_wallet : null,
                        currency : req.body.currency,
                        active : true
                    }
                    ac.wallets.push(wa);
                    return ac.save();
                })
                .then(function (sav) {
                    sav.wallets.forEach(function (wa) {
                        if (wa.currency == req.body.currency) {
                            res.status(201).send(wa);
                        }
                    })
                })
                 .catch(function (err) {
                    
                    console.log(new Error(err.message));
                    res.status(err.status || 500).send(err);
                    });
})
router.post('/:id/vwallets', c.checkWriteAccess, function (req, res) {
    if (!req.body.currency) {
                    var err = {};
                    err.code = 'EMISSING_REQUIRED';
                    err.message = 'You have not supplied required fields!';
                    err.status = 418;
                    throw err;
            }
            Account.findOne({_id : req.params.id})
                .then(function (acc) {
                    //check for wallet existence
                    acc.virtual_wallets.forEach(function (wa) {
                        if ((wa.currency == req.body.currency) && (wa.type == req.body.type)) {
                            var err = {};
                            err.code = "DUPLICATE_WALLET"
                            err.message = "Wallet of this currency already exists!"
                            err.status = 403;
                            throw err;
                        }
                    })
                    return Rate.findOne({destination : req.body.currency, source : "USD"}).exec()
                })
                .then(function (ra) {
                    if (ra !== null) {
                        return Account.findOne({_id : req.params.id}).exec();
                    } else {
                        var err = {};
                        err.code = "UNSUPORTED_CURRENCY"
                        err.message = "Sorry, this currency is not yet supported, please contact support";
                        err.status = 403;
                        throw err;
                    }
                })
                .then(function (ac) {
                    var myWalletId = randomIntFromInterval(10000000,99999999);
                    var wa = {
                        wallet_name : req.body.wallet_name || req.body.currency + ' Wallet',
                        wallet_id : req.body.currency + myWalletId,
                        type : req.body.type,
                        balance : 0,
                        currency : req.body.currency,
                        active : true
                    }
                    ac.virtual_wallets.push(wa);
                    return ac.save();
                })
                .then(function (sav) {
                    sav.wallets.forEach(function (wa) {
                        if (wa.currency == req.body.currency) {
                            res.status(201).send(wa);
                        }
                    })
                })
                 .catch(function (err) {
                    
                    console.log(new Error(err.message));
                    res.status(err.status || 500).send(err);
                    });
})
router.put('/:id/wallets/:wallet', c.checkWriteAccess, function (req, res) {
    if (req.body.primary) {
        res.locals.setToPrimary = true;
    } else {
        res.locals.setToPrimary = false;
    }
    Account.findOne({_id : req.params.id})
        .then(function (acc) {
            acc.wallets.forEach(function (wa) {
                if (res.locals.setToPrimary) {
                    if (wa._id == req.params.wallet) {
                        wa.primary = true;
                    } else {
                        wa.primary = false;
                    }
                } else {

                }
                if (req.body.wallet_name) {
                    if (wa._id == req.params.wallet) {
                        wa.wallet_name = req.body.wallet_name;
                    }
                }
            })
            return acc.save();
        })
        .then(function (sav) {
            sav.wallets.forEach(function (wa) {
                if (wa._id == req.params.wallet) {
                    res.status(200).send(wa);
                }
            })
        })
         .catch(function (err) {
                    
                    console.log(new Error(err.message));
                    res.status(err.status || 500).send(err);
                    });
})
router.get('/:id/acl', c.checkReadAccess, function (req, res) {
    console.log(req.user);
    console.log(req.user.canEditOwnAcl);
    if (req.user.main_account == req.params.id) {
        if (!req.user.canEditOwnAcl) {
            var err = {};
            err.code = "ENO_ACCESS"
            err.message = "Sorry, you dont have access to this method"
            err.status = 403;
            throw err;
        }
    }
    Account.findOne({_id : req.params.id})
        .then(function (acc) {
            if (acc.acl) {
                return Acl.findOne({_id : acc.acl}).exec()
            } else {
                var err = {}
                err.status = 404;
                err.code = "ACL_NOT_DEFINED"
                err.message = "ACL is not Defined"
                throw err;
            }
        })
        .then(function (acl) {
            res.json(acl);
        })
        .catch(function (err) {
                    console.log(new Error(err.message));
                    res.status(err.status || 500).send(err);
                    });
})
router.post('/:id/acl', c.checkWriteAccess, function (req, res) {

    Account.findOne({_id : req.params.id})
        .then(function (acc) {
            if (!req.body.type || !req.body.allow || !req.body.block) {
                var err = {};
                err.code = "EMISSING_REQUIRED"
                err.message = "Missing required fields"
                err.status = 500
                throw err;
            } else {
                if ( (req.body.allow.constructor === Array) && (req.body.block.constructor === Array)  ) {
                    var ac = new Acl();
                    ac.type = req.body.type;
                    ac.active = req.body.active;
                    ac.time = new Date()
                    req.body.allow.forEach(function (al) {
                        var o = {}
                        o.code = al.code
                        o.active = al.active ;
                        o.time = new Date()
                        ac.allow.push(o);
                    })
                    req.body.block.forEach(function (bl) {
                        var o = {}
                        o.code = bl.code
                        o.active = bl.active ;
                        o.time = new Date()
                        ac.block.push(o);
                    })
                    return ac.save();

                } else {
                    var err = {}
                    err.code = "TYPE_ERROR"
                    err.message = "Allow / Block must be arrays"
                    err.status = 500
                    throw err;
                }
            }
        })
        .then(function (acl) {
            res.locals.acl = acl;
            return Account.findOne({_id : req.params.id}).exec();
        })
        .then(function (acc) {
            acc.acl = res.locals.acl._id;
            return acc.save();
        })
        .then(function (sa) {
            res.status(201).send(res.locals.acl);
        })
        .catch(function (err) {
                    
                    console.log(new Error(err.message));
                    res.status(err.status || 500).send(err);
                    });
})
router.put('/:id/acl', c.checkWriteAccess, function (req, res) {

    Account.findOne({_id : req.params.id})
        .then(function (acc) {
            if (acc.acl) {
                return Acl.findOne({_id : acc.acl}).exec()
            } else {
                var err = {}
                err.code = "ACL_NOT_DEFINED"
                err.message = "Sorry. ACL is not defined"
                err.status = 404;
                throw err;
            }
            
        })
        .then(function (acl) {
            if (acl !== null) {
                if (req.body.type) {
                    var validop = ['restrictive', 'permissive'];
                    if (validop.contains(req.body.type)) {
                        acl.type = req.body.type;
                    }
                }
                if ('undefined' !== typeof req.body.active) {
                    acl.active = req.body.active;
                }
                if (req.body.block) {
                    if (req.body.block.constructor === Array) {
                        //remove old shtuff
                        var i = acl.block.length;
                        while (i--) {
                            var me = acl.block[i];
                            acl.block.remove(me);
                        }
                        req.body.block.forEach(function (it) {
                            var o = {
                                code : it.code,
                                active : it.active || true,
                                time : new Date()
                            }
                            acl.block.push(o)
                        })
                    }
                }
                if (req.body.allow) {
                    if (req.body.allow.constructor === Array) {
                        //remove old shtuff
                        var i = acl.allow.length;
                        while (i--) {
                            var me = acl.allow[i]
                            acl.allow.remove(me)
                        }
                        req.body.allow.forEach(function (it) {
                            var o = {
                                code : it.code,
                                active : it.active || true,
                                time : new Date()
                            }
                            acl.allow.push(o)
                        })
                    }
                }
                return acl.save();
            } else {
                var err = {};
                err.code = "ACL_NOT_EXIST";
                err.message = "ACL does not exist or has been deleted"
                err.status = 404;
                throw err;
            }
        })
        .then(function (ac) {
            res.json(ac);
        })
         .catch(function (err) {
                    
                    console.log(new Error(err.message));
                    res.status(err.status || 500).send(err);
                    });
})
router.get('/:id/acl/block', c.checkReadAccess, function (req, res) {

    Account.findOne({_id : req.params.id})
        .then(function (acc) {
            if (acc.acl) {
                return Acl.findOne({_id : acc.acl}).exec()
            } else {
                var err = {}
                err.code = "ACL_NOT_DEFINED"
                err.message = "Sorry. ACL is not defined"
                err.status = 404;
                throw err;
            }
            
        })
        .then(function (acl) {
            if (acl !== null) {
                res.json(acl.block);
            } else {
                var err = {};
                err.code = "ACL_NOT_EXIST";
                err.message = "ACL does not exist or has been deleted"
                err.status = 404;
                throw err;
            }
        })
         .catch(function (err) {
                    
                    console.log(new Error(err.message));
                    res.status(err.status || 500).send(err);
                    });
})

router.get('/:id/acl/allow', c.checkReadAccess, function (req, res) {

    Account.findOne({_id : req.params.id})
        .then(function (acc) {
            if (acc.acl) {
                return Acl.findOne({_id : acc.acl}).exec()
            } else {
                var err = {}
                err.code = "ACL_NOT_DEFINED"
                err.message = "Sorry. ACL is not defined"
                err.status = 404;
                throw err;
            }
            
        })
        .then(function (acl) {
            if (acl !== null) {
                res.json(acl.allow);
            } else {
                var err = {};
                err.code = "ACL_NOT_EXIST";
                err.message = "ACL does not exist or has been deleted"
                err.status = 404;
                throw err;
            }
        })
         .catch(function (err) {
                    
                    console.log(new Error(err.message));
                    res.status(err.status || 500).send(err);
                    });
})
router.get('/:id/acl/allow/:entry', c.checkReadAccess, function (req, res) {

    Account.findOne({_id : req.params.id})
        .then(function (acc) {
            if (acc.acl) {
                return Acl.findOne({_id : acc.acl}).exec()
            } else {
                var err = {}
                err.code = "ACL_NOT_DEFINED"
                err.message = "Sorry. ACL is not defined"
                err.status = 404;
                throw err;
            }
            
        })
        .then(function (acl) {
            if (acl !== null) {
                acl.allow.forEach(function (li) {
                    if (li._id == req.params.entry) {
                        res.json(li);
                    }
                })
            } else {
                var err = {};
                err.code = "ACL_NOT_EXIST";
                err.message = "ACL does not exist or has been deleted"
                err.status = 404;
                throw err;
            }
        })
         .catch(function (err) {
                    
                    console.log(new Error(err.message));
                    res.status(err.status || 500).send(err);
                    });
})
router.get('/:id/acl/block/:entry', c.checkReadAccess, function (req, res) {

    Account.findOne({_id : req.params.id})
        .then(function (acc) {
            if (acc.acl) {
                return Acl.findOne({_id : acc.acl}).exec()
            } else {
                var err = {}
                err.code = "ACL_NOT_DEFINED"
                err.message = "Sorry. ACL is not defined"
                err.status = 404;
                throw err;
            }
            
        })
        .then(function (acl) {
            if (acl !== null) {
                acl.block.forEach(function (li) {
                    if (li._id == req.params.entry) {
                        res.json(li);
                    }
                })
            } else {
                var err = {};
                err.code = "ACL_NOT_EXIST";
                err.message = "ACL does not exist or has been deleted"
                err.status = 404;
                throw err;
            }
        })
         .catch(function (err) {
                    
                    console.log(new Error(err.message));
                    res.status(err.status || 500).send(err);
                    });
})
router.post('/:id/acl/allow/', c.checkReadAccess, function (req, res) {

    if (!req.body.code) {
        var err = {}
        err.code = "EMISSING_REQUIRED"
        err.message = "Missing required parameters"
        err.status = 500
        throw err;
    }
    Account.findOne({_id : req.params.id})
        .then(function (acc) {
            if (acc.acl) {
                return Acl.findOne({_id : acc.acl}).exec()
            } else {
                var err = {}
                err.code = "ACL_NOT_DEFINED"
                err.message = "Sorry. ACL is not defined"
                err.status = 404;
                throw err;
            }
            
        })
        .then(function (acl) {
            if (acl !== null) {
                acl.allow.forEach(function (li) {
                    if (li.code == req.body.code) {
                        var err = {}
                        err.code = "ERULE_EXISTS"
                        err.message = "The rule already exists"
                        err.status = 500
                        throw err
                    }
                })
                acl.block.forEach(function (li) {
                    if (li.code == req.body.code) {
                        var err = {}
                        err.code = "ERULE_CONFLICT"
                        err.message = "There is a conflicting rule, please remove it first [BLOCK] : " + li._id
                        err.status = 500
                        throw err
                    }
                })
                var rule = {
                    code : req.body.code,
                    active : req.body.active || true,
                    time : new Date()
                }
                acl.allow.push(rule);
                return acl.save();
            } else {
                var err = {};
                err.code = "ACL_NOT_EXIST";
                err.message = "ACL does not exist or has been deleted"
                err.status = 404;
                throw err;
            }
        })
        .then(function (sav) {
            res.json(sav.allow);
        })
         .catch(function (err) {
                    
                    console.log(new Error(err.message));
                    res.status(err.status || 500).send(err);
                    });
})
router.post('/:id/acl/block/', c.checkReadAccess, function (req, res) {

    Account.findOne({_id : req.params.id})
        .then(function (acc) {
            if (acc.acl) {
                return Acl.findOne({_id : acc.acl}).exec()
            } else {
                var err = {}
                err.code = "ACL_NOT_DEFINED"
                err.message = "Sorry. ACL is not defined"
                err.status = 404;
                throw err;
            }
            
        })
        .then(function (acl) {
            if (acl !== null) {
                acl.block.forEach(function (li) {
                    if (li.code == req.body.code) {
                        var err = {}
                        err.code = "ERULE_EXISTS"
                        err.message = "The rule already exists"
                        err.status = 500
                        throw err
                    }
                })
                acl.allow.forEach(function (li) {
                    if (li.code == req.body.code) {
                        var err = {}
                        err.code = "ERULE_CONFLICT"
                        err.message = "There is a conflicting rule, please remove it first [ALLOW] : " + li._id
                        err.status = 500
                        throw err
                    }
                })
                var rule = {
                    code : req.body.code,
                    active : req.body.active || true,
                    time : new Date()
                }
                acl.block.push(rule);
                return acl.save();
            } else {
                var err = {};
                err.code = "ACL_NOT_EXIST";
                err.message = "ACL does not exist or has been deleted"
                err.status = 404;
                throw err;
            }
        })
        .then(function (sav) {
            res.json(sav.block);
        })
         .catch(function (err) {
                    
                    console.log(new Error(err.message));
                    res.status(err.status || 500).send(err);
                    });
})
router.get('/:id/acl/countries', c.checkReadAccess, async function (req, res) {
    var a = await Cache.get('clist');
    if (a !== false) {
        res.json(a);
    } else {
        CountryHelper.find()
        .then(async function (c) {
            await Cache.set('clist', c, 86400);
            res.json(c)
        })
        .catch(function (err) {
                    
                    console.log(new Error(err.message));
                    res.status(err.status || 500).send(err);
                    });
    }
   
})
router.get('/:id/acl/countries/:country', c.checkReadAccess, async function (req, res) {
    var a = await Cache.get('plist_' + req.params.country);
    if (a !== false) {
        res.json(a);
    } else {
        ProvHelper.find({iso : req.params.country})
        .then(async function (c) {
            await Cache.set('plist_' + req.params.country, c, 86400);
            res.json(c)
        })
        .catch(function (err) {
                    
                    console.log(new Error(err.message));
                    res.status(err.status || 500).send(err);
                    });
    }
    
})
router.get('/:id/fprofitmap', function (req, res) {
    Account.findOne({_id : req.params.id})
            .then(async function (acc) {
                if (acc.profit_map_fixed) {
                    var pmap = await FixedProfitMap.findOne({_id : acc.profit_map_fixed}).exec();
                } else {
                    //create one
                    var fp1 = new FixedProfitMap({
                        active : true,
                        time : new Date(),
                        maps : [
                            {
                                code : 'ALL:ALL',
                                currency : 'NGN',
                                rate : 1,
                                min_threshold_day : 0,
                                min_threshold_month : 0,
                                profit : 0,
                                active : true,
                                time : new Date()
                            },
                            {
                                code : 'NG:FT',
                                currency : 'NGN',
                                rate : 1,
                                min_threshold_day : 0,
                                min_threshold_month : 0,
                                profit : 0,
                                active : true,
                                time : new Date()
                            }
                        ]
                    });
                    var pmap = await fp1.save();
                    var a1 = await Account.findOne({_id : acc._id});
                    a1.profit_map_fixed = pmap._id;
                    await a1.save();
                }

                res.json(pmap)
            })
          
            .catch(function (err) {
                    
                    console.log(new Error(err.message));
                    res.status(err.status || 500).send(err);
                    });
})
router.get('/:id/profitmap', c.checkReadAccess, function (req, res) {
    if (req.params.id == req.user.main_account) {
        var err = {};
        err.code ="ENO_ACCESS"
        err.message = "Sorry, you don't have acces to this method"
        err.status = 403;
        throw err;
    } else {
        Account.findOne({_id : req.params.id})
            .then(function (acc) {
                if (acc.profit_map) {
                    return ProfitMap.findOne({_id : acc.profit_map}).exec();
                } else {
                    var err= {}
                    err.code = "PROFITMAP_UNDEFINED"
                    err.message = "Sorry, Profit Map for this account is not defined"
                    err.status = 404;
                    throw err;
                }
            })
            .then(function (pmap) {
                res.json(pmap)
            })
            .catch(function (err) {
                    
                    console.log(new Error(err.message));
                    res.status(err.status || 500).send(err);
                    });
    }
})

router.put('/:id/profitmap', c.checkWriteAccess, function (req, res) {
    if (req.params.id == req.user.main_account) {
        var err = {};
        err.code ="ENO_ACCESS"
        err.message = "Sorry, you don't have acces to this method"
        err.status = 403;
        throw err;
    } else { 
        Account.findOne({_id : req.params.id})
            .then(function (acc) {
                if (acc.profit_map) {
                    return ProfitMap.findOne({_id : acc.profit_map}).exec()
                } else {
                    var err= {}
                    err.code = "PROFITMAP_UNDEFINED"
                    err.message = "Sorry, Profit Map for this account is not defined"
                    err.status = 404;
                    throw err;
                }
            })
            .then(function (pmap) {
                if ('undefined' !== typeof req.body.active) {
                    pmap.active = req.body.active || true;
                }
                if ('undefined' !== typeof req.body.maps) {
                    if (req.body.maps.constructor === Array) {
                        var allBackupValue;
                        var allNeedFromBackup = true;
                        //get backup
                        pmap.maps.forEach(function (e) {
                            if (e.code == 'ALL:ALL') {
                                allBackupValue = e.profit_pct;
                            }
                        })
                         var i = pmap.maps.length;
                        while (i--) {
                            var me = pmap.maps[i]
                            pmap.maps.remove(me)
                        }
                        req.body.maps.forEach(function (e) {
                            var o = {}
                            o.code = e.code;
                            o.profit_pct = e.profit_pct;
                            o.time = new Date(),
                            o.active = e.active || true;
                            pmap.maps.push(o)
                            if (e.code == 'ALL:ALL') {
                                allNeedFromBackup = false;
                            }
                        })
                        if (allNeedFromBackup) {
                            var o = {}
                            o.code = 'ALL:ALL';
                            o.profit_pct = allBackupValue;
                            o.time = new Date()
                            o.active = true;
                            pmap.maps.push(o);
                        }

                    }
                }
                return pmap.save();
            })
            .then(function (pm) {
                res.json(pm);
            })
            .catch(function (err) {
                    
                    console.log(new Error(err.message));
                    res.status(err.status || 500).send(err);
                    });
}
})
router.put('/:id/fprofitmap', c.checkWriteAccess, function (req, res) {
        Account.findOne({_id : req.params.id})
            .then(function (acc) {
                if (acc.profit_map_fixed) {
                    return FixedProfitMap.findOne({_id : acc.profit_map_fixed}).exec()
                } else {
                    var err= {}
                    err.code = "FPROFITMAP_UNDEFINED"
                    err.message = "Sorry, Profit Map for this account is not defined"
                    err.status = 404;
                    throw err;
                }
            })
            .then(function (pmap) {
                if ('undefined' !== typeof req.body.active) {
                    pmap.active = req.body.active || true;
                }
                if ('undefined' !== typeof req.body.maps) {
                    if (req.body.maps.constructor === Array) {
                        var allBackupValue;
                        var allNeedFromBackup = true;
                        //get backup
                        pmap.maps.forEach(function (e) {
                            if (e.code == 'ALL:ALL') {
                                allBackupValue = e.profit;
                            }
                        })
                         var i = pmap.maps.length;
                        while (i--) {
                            var me = pmap.maps[i]
                            pmap.maps.remove(me)
                        }
                        req.body.maps.forEach(function (e) {
                            var o = {}
                            o.code = e.code;
                            o.profit = e.profit;
                            o.time = new Date(),
                            o.active = e.active || true;
                            o.currency = e.currency;
                            pmap.maps.push(o)
                            if (e.code == 'ALL:ALL') {
                                allNeedFromBackup = false;
                            }
                        })
                        if (allNeedFromBackup) {
                            var o = {}
                            o.code = 'ALL:ALL';
                            o.profit = allBackupValue;
                            o.time = new Date()
                            o.active = true;
                            o.currency = 'NGN';
                            pmap.maps.push(o);
                        }

                    }
                }
                return pmap.save();
            })
            .then(function (pm) {
                res.json(pm);
            })
            .catch(function (err) {
                    
                    console.log(new Error(err.message));
                    res.status(err.status || 500).send(err);
                    });

})
router.get('/:id/parent',  async function (req, res) {
    var a = await Cache.get('par_' + req.params.id);
    if (a !== false ) {
        res.json(a);
    } else {
        Account.findOne({_id : req.params.id}).exec()
        .then(function (acc) {
            return Account.findOne({_id : acc.parent}).exec();
        })
        .then(async function (p) {
            var pobj = {};
            pobj._id = p._id;
            pobj.account_name = p.account_name;
            pobj.phone = p.phone;
            pobj.address = p.address;
            pobj.legal_type = p.legal_type;
            pobj.invoice_logo = p.invoice_logo;
            pobj.email = p.email;
            await Cache.set('par_' + req.params.id, pobj, 86400);
            res.json(pobj);
        })
        .catch(function (err) {
            err.status = 500;
            err.code = 'EDB_ERROR';
            throw err;
        })
    }
    
});
router.post('/:id/logoupload', upload.single('userPhoto'), function (req, res) {
    Account.findOne({_id : req.params.id}).exec()
        .then(function (acc) {
            if (acc !== null) {
                acc.whitelabel_opts.portal_logo = req.file.filename;
                return acc.save();
            } else {
                res.sendStatus(404);
            }
        })
        .then(function (resp) {
            res.sendStatus(201);
        })
        .catch(function (err) {
            err.status = 500;
            err.code = 'EDB_ERROR';
            throw err;
        })
});

router.post('/:id/faviconupload', c.checkWriteAccess, upload.single('userPhoto'), function (req, res) {
    console.log('sdfghjklasdfghjklsdfghjk');
    Account.findOne({_id : req.params.id}).exec()
        .then(function (acc) {
            if (acc !== null) {
                console.log("define:  ",acc.whitelabel_opts.portal_favicon);
                acc.whitelabel_opts.portal_favicon = req.file.filename;

                return acc.save();
            } else {
                res.sendStatus(404);
            }
        })
        .then(function (resp) {
            res.sendStatus(201);
        })
        .catch(function (err) {
            err.status = 500;
            err.code = 'EDB_ERROR';
            throw err;
        })
});

//Edit Account
router.put('/:id', function(req, res) {
        Account.findOne({_id : req.params.id}).exec()
        .then(function (acc) {
           for (var key in req.body) {
               var forbiddenKeys = ['audit', 'rwaccess', 'roaccess', '_id', 'hasSystemAccess', 'createdAt', 'updatedAt', '__v', 'parent', 'wallets', 'currency', 'type'];
               if (forbiddenKeys.contains(key))
                    continue;
               acc[key] = req.body[key];
           }
            return acc.save();
        })
        .then(function (smth) {
            res.json(smth);
        })
        .catch(function (err) {
            err.status = 500;
            err.code = 'EDB_ERROR';
            throw err;
        });
});
//Delete Account
router.delete('/:id', c.checkWriteAccess, function (req, res) {
    //check if we have rights...
        Account.find({parent : req.params.id}).exec()
        .then(function (acc) {
            if (acc.length > 0) {
                res.sendStatus(405);
            } else {
                //noooothing
                User.find({main_account : req.params.id}).remove().exec();
                Account.find({_id : req.params.id}).remove().exec();
                res.sendStatus(204);
            }
        })
        .catch(function (err) {
            err.code = 'EDB_ERROR';
            err.status = 500;
            throw err;
        });
});
router.all('/:id', function (req, res) {
    var err = {};
    err.message = 'Unsupported method';
    err.status = 405;
    err.code = 'EUNSUP_METHOD';
    throw err;
});
//GET Child Accounts

//Create Child Account
router.post('/:id/accounts', function (req, res) {
    //check for mandatory fields
    if (!req.body.account_name || !req.body.legal_type) {
                    var err = {};
                    err.code = 'EMISSING_REQUIRED';
                    err.message = 'You have not supplied required fields!';
                    err.status = 418;
                    throw err;
    }
    


Account.findOne({_id : req.params.id})
    .then(function (par) {
       res.locals.pardetails = par;
       return Account.findOne({account_name : req.body.account_name}).exec();
    })
    .then(function (accheck) {
        if (accheck !== null) {
            var err = {};
            err.message = 'Account already exists!';
            err.status = 409;
            throw err;
        } else {
            var bodycheck;
            var parent;
            var manager;
            var newtype;
            var legal = ['individual', 'company'];
            //creating account
            if (res.locals.pardetails) {
                switch (res.locals.pardetails.type) {
                    case "system":
                        newtype = 'wholesaler';
                    break;
                    case "wholesaler":
                        newtype = 'reseller';
                    break;
                    case "reseller":
                        newtype = 'agent';
                    break;
                    default:
                        var err = {};
                        err.status = 500;
                        err.code = "INCOMPATIBLE_PARENT";
                        err.message = "Sorry, but you cannot create Child Agent of Agent....."
                        throw err;
                }
            }
           bodycheck = req.body.type || newtype;
           if (bodycheck == 'agent') {
               if (res.locals.pardetails.type == 'agent') {
                      var err = {};
                        err.status = 500;
                        err.code = "INCOMPATIBLE_PARENT";
                        err.message = "Sorry, but you cannot create Child Agent of Agent....."
                        throw err;
               }
           }
           parent = req.params.id;
            if (legal.contains(req.body.legal_type)) {

            } else {
                var err = {};
                    err.code = 'EUNSUP_ELEMENT_VALUE';
                    err.message = 'We dont support such legal_type';
                    err.status = 405;
                    throw err;
            }
            var ac = new Account();
                ac.account_name = req.body.account_name;
                ac.type = bodycheck;
                ac.parent = parent;
                res.locals.cur = req.body.currency || res.locals.pardetails.currency;
                var wa = {
                    wallet_name : res.locals.cur + " Wallet",
                    wallet_id : res.locals.cur + randomIntFromInterval(10000000, 99999999),
                    primary : true,
                    currency : res.locals.cur || 'USD',
                    balance : 0,
                    active : true,
                    virtual : false,
                    parent_wallet : null
                }
                ac.wallets.push(wa);
                ac.numeric_id = randomIntFromInterval(10000000, 99999999);
		ac.test_mode = req.body.test_mode || false;
        ac.sms_cost = req.body.sms_cost || 0.1;
                ac.canEditOwnAcl = req.body.canEditOwnAcl || true;
                for (var key in req.body) {
                    if ((key == 'parent') || (key == 'balance') || (key == 'permitted_apis') || (key == 'currency'))
                        continue;
                    ac[key] = req.body[key];
                }
                return ac.save();

        }
    })
     .then(function (a) {
        //create profitmap
        res.locals.a = a;
        var pmap = {
            active : true,
            time : new Date(),
            maps : [
                {
                    code : 'ALL:ALL',
                    profit_pct : res.locals.pct || 0,
                    active : true,
                    time : new Date()
                }
            ]
        }
        var pm = new ProfitMap(pmap)
        return pm.save();
    })
    .then(function (pm) {
        res.locals.pm = pm;
        return Account.findOne({_id : res.locals.a._id}).exec();
    })
    .then(function (pa) {
        pa.profit_map = res.locals.pm._id;
        return pa.save();
    })
    .then(function (pz) {
        res.status(201).send(pz);
    })
    .catch(function (err) {
        console.log(new Error(err.message));
        res.status(err.status || 500).send(err)
    })
});

//GET Active / Inactive child accounts 
router.get('/:id/accounts', c.checkReadAccess, function (req, res) {
        var mod;
       
        Account.find({parent : req.params.id}).exec()
        .then(function (l) {
            var re = {};
            re.count = l.length;
            re.accounts = l;
            res.json(re);
        })
        .catch(function (err) {
            err.code = 'EDB_ERROR';
            err.status = 500;
            throw err;
        });
});
router.all('/:id/accounts/:modifier', function (req, res) {
    var err = {};
    err.message = 'Unsupported method';
    err.status = 405;
    err.code = 'EUNSUP_METHOD';
    throw err;
});
//GET RWaccess users 
router.get('/:id/rwaccess', c.checkReadAccess, function (req, res) { 
        Account.findOne({_id : req.params.id}, {rwaccess : true}).exec()
        .then(function (rw) {
            var resp = {};
            resp.count = rw.rwaccess.length;
            resp.rwaccess = rw.rwaccess;
            res.json(resp);
        })
        .catch(function (err) {
            err.code = 'EDB_ERROR';
            err.status = 500;
            throw err;
        });
});
//EDIT RWaccess
router.put('/:id/rwaccess', c.checkWriteAccess, function (req, res) {
        Account.findOne({_id : req.params.id}).exec()
        .then(function (a) {
            a.rwaccess = [];
            req.body.rwaccess.forEach(function (o) {
                a.rwaccess.push(new oid(o));
            });
            return a.save();
        })
        .then(function (rw) {
            var resp = {};
            resp.count = rw.rwaccess.length;
            resp.rwaccess = rw.rwaccess;
            res.json(resp);
        })
        .catch(function (err) {
            err.code = 'EDB_ERROR';
            err.status = 500;
            throw err;
        });
});
router.all('/:id/rwaccess', function (req, res) {
    var err = {};
    err.message = 'Unsupported method';
    err.status = 405;
    err.code = 'EUNSUP_METHOD';
    throw err;
});
//GET ROaccess

router.get('/:id/roaccess', c.checkReadAccess, function (req, res) { 
        Account.findOne({_id : req.params.id}, {roaccess : true}).exec()
        .then(function (rw) {
            var resp = {};
            resp.count = rw.roaccess.length;
            resp.roaccess = rw.roaccess;
            res.json(resp);
        })
        .catch(function (err) {
            err.code = 'EDB_ERROR';
            err.status = 500;
            throw err;
        });
});
//EDIT ROaccess
router.put('/:id/roaccess', c.checkWriteAccess, function (req, res) {
        Account.findOne({_id : req.params.id}).exec()
        .then(function (a) {
            a.roaccess = [];
            req.body.roaccess.forEach(function (o) {
                a.roaccess.push(new oid(o));
            });
            return a.save();
        })
        .then(function (rw) {
            var resp = {};
            resp.count = rw.roaccess.length;
            resp.roaccess = rw.roaccess;
            res.json(resp);
        })
        .catch(function (err) {
            err.code = 'EDB_ERROR';
            err.status = 500;
            throw err;
        });
});
router.all('/:id/rwaccess', function (req, res) {
    var err = {};
    err.message = 'Unsupported method';
    err.status = 405;
    err.code = 'EUNSUP_METHOD';
    throw err;
});
/*
router.get('/:id/products', c.checkReadAccess, function (req, res) {
   
        Product.find({account : req.params.id}).exec()
   .then(function (pack) {
       var p = {};
       p.count = pack.length;
       p.packages = [];
       pack.forEach(function (pa) {
           delete pa.package_items;
           p.packages.push(pa);
       });
       res.json(p);
   })
   .catch(function (err) {
            err.code = 'EDB_ERROR';
            err.status = 500;
            throw err;
   });
   
});
*/
router.post('/:id/topup', c.checkWriteAccess, function (req, res) {
        var a = parseFloat(req.body.amount)
        var b = req.body.destination;
            //log tx
            //and then update db
         Account.findOne({_id : req.params.id})
            .then(function (acc) {
                var currency;
                var bbfor = 0;
                var baft = 0;
                acc.wallets.forEach(function (f) {
                    if (f.wallet_id == b) {
                        bbfor = f.balance;
                        f.balance += a;
                        currency = f.currency;
                        baft = f.balance;
                    }
                })
                   var tr = new Transaction();
            tr.source = 'System top-up';
            tr.account = new oid(req.params.id);
            if (a > 0) {
                tr.type = 'crd';
            } else {
                tr.type = 'deb';
            }
            tr.amount = Math.abs(a);
            tr.currency = currency;
            tr.description = req.body.description;
            tr.made_by = req.user.first_name + ' ' + req.user.last_name;
            tr.balance_before = bbfor;
            tr.balance_after = baft;
            tr.wallet_id = b;
            tr.save();
            return acc.save();
            })
            .then(function (resp) {
                res.sendStatus(200);
            })
            .catch(function (err) {
            err.code = 'EDB_ERROR';
            err.status = 500;
            console.log(err)
            res.status(err.status).send(err);
   });
})
router.post('/:id/vtopup', c.checkWriteAccess, function (req, res) {
    var a = parseFloat(req.body.amount)
    var b = req.body.destination;
        //log tx
        //and then update db
     Account.findOne({_id : req.params.id})
        .then(function (acc) {
            var currency;
            acc.virtual_wallets.forEach(function (f) {
                if (f.wallet_id == b) {
                    f.balance += a;
                    currency = f.currency;
                }
            })
               var tr = new Transaction();
        tr.source = 'System top-up';
        tr.account = new oid(req.params.id);
        if (a > 0) {
            tr.type = 'crd';
        } else {
            tr.type = 'deb';
        }
        tr.amount = Math.abs(a);
        tr.currency = currency;
        tr.description = req.body.description;
        tr.save();
        return acc.save();
        })
        .then(function (resp) {
            res.sendStatus(200);
        })
        .catch(function (err) {
        err.code = 'EDB_ERROR';
        err.status = 500;
        console.log(err)
        res.status(err.status).send(err);
});
})
//items
router.get('/:id/transactions/page/:page', c.checkReadAccess, function (req, res) {
    var opts = {page : req.params.page, limit : 100, sort : {time : -1}};
    
    Transaction.paginate({account : req.params.id}, opts)
        .then(function (f) {
             var o = {};
            o.count = f.total;
            o.pages = f.pages;
            o.page = f.page;
            o.limit = f.limit;
            o.docs = f.docs;
            res.json(o);
        })
        .catch(function (err) {
                    res.status = err.status || 500;
                    console.log(new Error(err.message));
                    res.json(err.status, err);
                    });
})
router.get('/:id/pricelist.csv', c.checkReadAccess, function (req, res) {
     var ms = cs.map(function *(d) {
                        var prof = yield NumLookup.getProfits(req.params.id, d.iso, d.acloperId);
                        var agentProfit = (prof.agentProfit + 100) / 100;
                        var resProfit = (prof.resProfit + 100) / 100;
                        var wholeProfit = (prof.wProfit + 100) / 100;
                        var acc = yield Account.findOne({_id : req.params.id}).exec();
                        var u;
                        var cur = [];
                        acc.wallets.forEach(function (e) {
                            if (e.primary == true) {
                                u = e;
                            }
                                cur.push(e)
                        })
                        if (cur.contains(d.currency)) {
                            if (d.fx_rate == '-') {
                                
                                var pr = (parseFloat(d.price) * agentProfit * resProfit * wholeProfit).toFixed(2);
                                var st = d.sku + ',' + d.country + ',' + d.name + ',' + d.min_denomination + ',' + d.max_denomination + ',' + d.topup_currency + ',' + d.step + ',' + d.fx_rate + ',' + d.currency + ',' + pr + '\n';
                            } else {
                                var loclist = ['NGN', 'GHS', 'BDT']
                                if (loclist.contains(d.currency)) {
                                    var pr = (parseFloat(1) * agentProfit * resProfit * wholeProfit).toFixed(2);
                                
                                } else {
                                  
                                   var pr =  (d.fx_rate - ((parseFloat(d.fx_rate) * prof.agentProfit) / 100) - ((parseFloat(d.fx_rate) * prof.resProfit) / 100) - ((parseFloat(d.fx_rate) * prof.wProfit) / 100)).toFixed(2)
                                }
                                
                                var st = d.sku + ',' + d.country + ',' + d.name + ',' + d.min_denomination + ',' + d.max_denomination + ',' + d.topup_currency + ',' + d.step + ',' + pr + ',' + d.currency + ',' + d.price + '\n';
                            }
                        } else {
                             if (u.currency !== d.currency) {
                              
                            var rate = yield Rate.findOne({source : d.currency, destination : u.currency}).exec();
                            var rateRev = yield Rate.findOne({source : u.currency, destination  : d.currency}).exec();
                            var rateFromUSD = yield Rate.findOne({source : 'USD', destination : u.currency}).exec();
                            var rateToUSD = yield Rate.findOne({source : 'USD', destination : d.currency}).exec();

                            var needsFX = true;
                        } else {
                            var needsFX = false;
                        }
                        if (d.fx_rate == '-') {
                            var pr =   (parseFloat(d.price) * agentProfit * resProfit * wholeProfit).toFixed(2);
                            if (needsFX) {
                                if (rate !== null) {
                                    pr = (pr * rate.rate).toFixed(2);
                                } else if (rateRev !== null) {
                                    pr = (pr / rateRev.rate).toFixed(2);
                                } else if ( (rateFromUSD !== null) && (rateToUSD !== null) ) {
                                    var s1 = (pr / rateToUSD.rate);
                                    pr = (s1 * rateFromUSD.rate);
                                }
                                
                                d.currency = u.currency
                            }
                            var st = d.sku + ',' + d.country + ',' + d.name + ',' + d.min_denomination + ',' + d.max_denomination + ',' + d.topup_currency + ',-,' + d.fx_rate + ',' + d.currency + ',' + pr + '\n';
                        } else {
                           var ra =  (d.fx_rate - ((parseFloat(d.fx_rate) * prof.agentProfit) / 100) - ((parseFloat(d.fx_rate) * prof.resProfit) / 100) - ((parseFloat(d.fx_rate) * prof.wProfit) / 100)).toFixed(2)
                                    if (needsFX) {
                                if (rate !== null) {
                                    ra = (ra / rate.rate).toFixed(2);
                                } else if (rateRev !== null) {
                                    ra = (ra * rateRev.rate).toFixed(2);
                                } else if ( (rateFromUSD !== null) && (rateToUSD !== null) ) {
                                    var s1 = (ra * rateToUSD.rate);
                                    ra = (s1 / rateFromUSD.rate).toFixed(2);
                                }
                                
                                d.currency = u.currency
                            } 
                           var st = d.sku + ',' + d.country + ',' + d.name + ',' + d.min_denomination + ',' + d.max_denomination + ',' + d.topup_currency + ',' + d.step + ',' + ra + ',' + d.currency + ',' + d.price + '\n';
                        }
                        }
                       var apiID = st.split(',')[0].split('-')[0];
                       if (acc.permitted_apis.contains(apiID)) {
                            return st;
                       }
                        
}, { objectMode: true, parallel: 5 });

    co(function* () {
         var accA = yield Account.findOne({_id : req.params.id}).exec();
     var uuA = yield User.findOne({main_account : accA._id}).exec();
     res.locals.pxA = yield Account.findOne({_id : uuA.reseller_id}).exec();
    })
    .then(function () {
        //{apid : {$in : res.locals.pxA.permitted_apis}}
        var str = Baseprod.find().sort({country : 1, name : 1}).batchSize(100000).cursor();
		res.writeHead(200, {
                'Content-Type': 'text/csv',
                'Access-Control-Allow-Origin': '*',
                'Content-Disposition': 'attachment; filename=pricelist.csv'
            });
var st = "SKU,Country,Operator Name,Min Denom.,Max Denom,Local Currency, Denom. Step,Rate,Currency,Price\n";
            res.write(st);
    str.pipe(ms).pipe(res);
    })
    
 
           
    
})
/*
router.get('/:id/pricelist.csv', function (req, res) {
    var stri = Product.find({account : req.params.id, active : true}).cursor();
               var filename = 'pricelist.csv';
               res.writeHead(200, {
                'Content-Type': 'text/csv',
                'Access-Control-Allow-Origin': '*',
                'Content-Disposition': 'attachment; filename=' + filename
            });
            var st = "SKU,Country,Operator Name,Min Denom.,Max Denom,Local Currency, Denom. Step,Rate,Currency,Price\n";
            res.write(st);
               stri.on("data", function (d) {
                   console.log('D', d);
                   var str = d.sku + ',' + d.country + ',' + d.name + ',' + d.min_denomination + ',' + d.max_denomination + ',' + d.topup_currency + ',' + d.step + ',' + d.fx_rate + ',' + d.currency + ',' + d.price + '\n';
                   res.write(str);
               })
               stri.on("end", function () {
                   res.end();
               })
})
*/
router.get('/:id/transactions.csv', function (req, res) {
		var str = Transaction.find({account : req.params.id}).batchSize(1000000000).cursor();
		res.writeHead(200, {
                'Content-Type': 'text/csv',
                'Access-Control-Allow-Origin': '*',
                'Content-Disposition': 'attachment; filename=transactions.csv'
            });
            var st = "Time,Account,Type,Amount,Currency,Description,Source\n";
            res.write(st);
		str.on("data", function (d) {
                   var str = d.time + ',' + d.account + ',' + d.type + ',' + d.amount + ',' + d.currency + ',' + d.description + ',' + d.source + '\n';
                   res.write(str);
               })
               str.on("end", function () {
                   res.end();
               })
})
router.post('/:id/users', c.checkWriteAccess, function (req, res) {
    Account.findOne({_id : req.params.id})
        .then(function (acc) {
            res.locals.acc = acc;
            if (acc.type == 'wholesaler') {
                res.locals.needwholesaler = false;
                return acc;
            } else if (acc.type == 'reseller') {
                res.locals.needwholesaler = false;
                
                return acc;
            } else if (acc.type == 'agent') {
                //you cannot create agent of an agent
               res.locals.needwholesaler = true;
               return Account.findOne({_id : acc.parent}).exec();
            }
        })
        .then(function (rere) {
             if (rere.type == 'wholesaler') {
                    res.locals.wholesaler = rere._id;
                } else if (rere.type == 'reseller') {
                    res.locals.wholesaler = rere.parent;
                }
                return rere;
        })
        .then(function (bcc) {
             var ra = {};
    for (var key in req.body) {
                    if ((key == 'password') || (key == 'main_account') || (key == 'access_type'))
                        continue;
                    ra[key] = req.body[key];   
                }
                ra.password = authc(req.body.password);
                ra.main_account = req.params.id;
                ra.active = true;
                ra.reseller_id = res.locals.wholesaler;
                var u = new User(ra);
                return u.save();
              
        })
        .then(function (us) {
            res.locals.r = us._id;
                   return Account.findOne({_id : req.params.id}).exec()
        })
        .then(function (acc2) {
                        acc2.rwaccess.push(res.locals.r);
                        return acc2.save();
                    })
                    .then(function (e) {
                        res.sendStatus(200);
                    })
                    .catch(function (err) {
                    res.status = err.status || 500;
                    console.log(new Error(err.message));
                    res.json(err.status, err);
                    });
   
});
router.get('/:id/users', c.checkReadAccess, function (req, res) {
    User.find({main_account : req.params.id}, {password : false})
    .then(function (u) {
        console.log(u);
        var r = {};
        r.count = u.length;
        r.users = [];
        u.forEach(function (a) {
            r.users.push(a);
        });
        res.json(r);
    })
    .catch(function (err) {
                    res.status = err.status || 500;
                    console.log(new Error(err.message));
                    res.json(err.status, err);
                    });
})
router.get('/:id/users/:uid', c.checkReadAccess, function (req, res) {
    User.findOne({_id : req.params.uid}, {password : false})
    .then(function (u) {
        res.json(u);
    })
    .catch(function (err) {
                    res.status = err.status || 500;
                    console.log(new Error(err.message));
                    res.json(err.status, err);
                    });
});
router.put('/:id/users/:uid', function(req, res) {
    User.findOne({_id : req.params.uid})
    .then(function (u) {
        for (key in req.body) {
            if ( (key == 'password') || (key == '_id') || (key == 'updatedAt') || (key == 'createdAt') || (key == 'last_login') || (key == 'username') || (key == 'avatar'))
                continue;
                
            u[key] = req.body[key];
        }
  if (req.body.password) {
	console.log('GOT PASS', req.body[key], authc(req.body[key]))        
        u.password = authc(req.body.password);
        }
        return u.save();
    })
    .then(function (uz) {
        var no = {};
        delete uz.password;
        res.json(uz);
    })
    .catch(function (err) {
                    res.status = err.status || 500;
                    console.log(new Error(err.message));
                    res.json(err.status, err);
                    });
});
router.post('/:id/users/:uid/avatar', c.checkWriteAccess, upload.single('userPhoto'), function (req, res) {
    User.findOne({main_account : req.params.id, _id : req.params.uid}).exec()
        .then(function (acc) {
            if (acc !== null) {
                acc.avatar = req.file.filename;
                return acc.save();
            } else {
                res.sendStatus(404);
            }
        })
        .then(function (resp) {
            res.sendStatus(201);
        })
        .catch(function (err) {
            err.status = 500;
            err.code = 'EDB_ERROR';
            throw err;
        })
});
router.delete('/:id/users/:uid', c.checkWriteAccess, function (req, res) {
    //revoke access
    Account.findOne({_id : req.params.id})
        .then(function (a) {
            delete a.rwaccess[req.params.uid];
            delete a.roaccess[req.params.uid];
            return a.save();
        })
        .then(function (u) {
            User.findOne({_id : req.params.uid}).remove().exec();
            res.sendStatus(204);
        })
})
router.get('/:id/topuplog/page/:page', c.checkReadAccess, function (req, res) {
    var opts = {page : req.params.page, limit : 100, sort : {time : -1}, select : {response_debug : false, request_debug : false}};
    
    Topuplog.paginate({account : req.params.id}, opts)
        .then(function (f) {
             var o = {};
            o.count = f.total;
            o.pages = f.pages;
            o.page = f.page;
            o.limit = f.limit;
            o.docs = f.docs;
            res.json(o);
        })
        .catch(function (err) {
                    res.status = err.status || 500;
                    console.log(new Error(err.message));
                    res.json(err.status, err);
                    });
})
router.get('/:aid/drules', function (req, res) {
    DynamicRule.find({isSystemWide : false, account : req.params.aid})
        .then(function (app) {
            var r = {
                count: app.length,
                rulesets: app
            }
            res.json(r)
        })
})
router.get('/:aid/drules/:id', function (req, res) {
    DynamicRule.findOne({_id: req.params.id, account : req.params.aid})
        .then(function (crd) {
            res.json(crd)
        })
})
router.put('/:aid/drules/:id', function (req, res) {

    DynamicRule.findOne({_id: req.params.id, account : req.params.aid})
        .then(function (crd) {
            //console.log(crd, req.body);

            var fKeys = ['rules']
            for (var key in req.body) {
                if (fKeys.contains(key)) {
                    continue;
                }
                crd[key] = req.body[key];
            }
           if (req.body.rules) {
               var i = crd.rules.length;
               while (i--) {
                   var me = crd.rules[i];
                   crd.rules.remove(me);
               }
               req.body.rules.forEach(function (x) {
                var a = {};
                a.tag = x.tag;
                a.priority = x.priority;
                a.active = x.active;
                crd.rules.push(a);
               })
           }
           

            return crd.save();
        })
        .then(function (tx) {
            res.json(tx)
        })

})
router.post('/:aid/drules/', function (req, res) {
    var o = new DynamicRule()
    var fKeys = ['rules']
    for (var key in req.body) {
        if (fKeys.contains(key)) {
            continue;
        }
        o[key] = req.body[key];
    }
    o.rules = [];
    req.body.rules.forEach(function (x) {
        var a = {};
        a.tag = x.tag;
        a.priority = x.priority;
        a.active = x.active;
        o.rules.push(a);
    })
    o.account = req.params.aid;
    o.save(function (err, ob) {
        if (err) {
            res.sendStatus(500)
        } else {
            res.status(201).send(ob);
        }
    })
})
router.delete('/:aid/drules/:sid', async (req,res) => {
    var xyx  = await DynamicRule.findOneAndRemove({_id : req.params.sid, account : req.params.aid}).exec();
    res.sendStatus(204);
})
/* DR RULES */
/* FR RULES */
router.get('/:aid/frules', function (req, res) {
    FinancialRule.find({isSystemWide : false, account : req.params.aid})
        .then(function (app) {
            var r = {
                count: app.length,
                rulesets: app
            }
            res.json(r)
        })
})
router.get('/:aid/frules/:id', function (req, res) {
    FinancialRule.findOne({_id: req.params.id, account : req.params.aid})
        .then(function (crd) {
            res.json(crd)
        })
})
router.put('/:aid/frules/:id', function (req, res) {

    FinancialRule.findOne({_id: req.params.id, account : req.params.aid})
        .then(function (crd) {
            //console.log(crd, req.body);

            var fKeys = ['rules']
            for (var key in req.body) {
                if (fKeys.contains(key)) {
                    continue;
                }
                crd[key] = req.body[key];
            }
           if (req.body.rules) {
               var i = crd.rules.length;
               while (i--) {
                   var me = crd.rules[i];
                   crd.rules.remove(me);
               }
               req.body.rules.forEach(function (x) {
                var a = {};
                a.tag = x.tag;
                a.priority = x.priority;
                a.active = x.active;
                a.dont_use_below = x.dont_use_below;
                crd.rules.push(a);
               })
           }
           

            return crd.save();
        })
        .then(function (tx) {
            res.json(tx)
        })

})
router.post('/:aid/frules/', function (req, res) {
    var o = new FinancialRule()
    var fKeys = ['rules']
    for (var key in req.body) {
        if (fKeys.contains(key)) {
            continue;
        }
        o[key] = req.body[key];
    }
    o.rules = [];
    req.body.rules.forEach(function (x) {
        var a = {};
        a.tag = x.tag;
        a.priority = x.priority;
        a.active = x.active;
        a.dont_use_below = x.dont_use_below;
        o.rules.push(a);
    })
    o.account = req.params.aid;
    o.save(function (err, ob) {
        if (err) {
            res.sendStatus(500)
        } else {
            res.status(201).send(ob);
        }
    })
})
router.delete('/:aid/frules/:sid', async (req,res) => {
    var xyx  = await FinancialRule.findOneAndRemove({_id : req.params.sid, account : req.params.aid}).exec();
    res.sendStatus(204);
})
router.get('/:id/credentials', c.checkReadAccess, function (req, res) {
    Apicred.find({account : req.params.id, isSystemWide : false})
        .then(function (cr) {
            var r = {
                count : cr.length,
                credentials : cr
            }
            res.json(r);
        })
})
router.get('/:id/credentials/:apicode', c.checkReadAccess, function (req, res) {
    Apicred.findOne({account : req.params.id, _id : req.params.apicode})
        .then(function (ap) {
            res.json(ap)
        })
})
router.put('/:id/credentials/:apicode', function (req, res) {
    Apicred.findOne({account : req.params.id, _id : req.params.apicode})
        .then(function (crd) {
            console.log(req.body)
           //   delete crd.sourceNumbers;
            var fKeys = ['sourceNumbers', 'isSystemWide', 'srcNum', 'updatedAt', 'createdAt', '__v']
            
            for (var key in req.body) {
                if (fKeys.contains(key)) {
                        continue;
                }
                        
                crd[key] = req.body[key];
            }
            if (req.body.srcNum !== '') {
             //   delete crd.sourceNumbers;
                if (req.body.srcNum.indexOf(',') > -1) {
                crd.sourceNumbers = [];
                crd.sourceNumbers = req.body.srcNum.split(',');
            } else {
                crd.sourceNumbers = [];
                crd.sourceNumbers.push(req.body.srcNum);
            }
            }
            
          //  var sa = req.body.srcNum.split(',')
          //  crd.sourceNumbers = sa;
            console.log('CRD', crd)
            return crd.save();
        })
        .then(function (a) {
            res.json(a);
        })
})
router.delete('/:id/credentials/:apicode', function (req, res) {
    Apicred.findOneAndRemove({account : req.params.id, _id : req.params.apicode })
            .then(function (x) {
                  res.json({success : true})
            })
      
})
router.post('/:id/credentials', function (req, res) {
    console.log(req.body);
     var o = new Apicred()
     var fKeys = ['sourceNumbers', 'isSystemWide', 'srcNum']
     for (var key in req.body) {
        if (fKeys.contains(key)) {
            continue;
        }
         o[key] = req.body[key];
     }
     o.isSystemWide = false;
     o.account = req.params.id;
     if ('undefined' !== typeof req.body.srcNum) {
             if (req.body.srcNum !== '') {
         o.sourceNumbers = [];
     o.sourceNumbers = req.body.srcNum.split(',')
     }
     }

    
    console.log('OOO', o)
     o.save(function (err, s) {
         if (err) {
             console.log(err)
             res.sendStatus(500);
         }
         res.status(201).send(s);
     })
})
module.exports = router;
