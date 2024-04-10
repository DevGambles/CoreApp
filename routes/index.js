var express = require('express');
var router = express.Router();
var offset = require('timezone-name-offsets');
var DateWithOffset = require('date-with-offset');
const excel = require('node-excel-export');
var User = require('../models/user');
var Admin = require('../models/admin');
var Operator = require('../models/operator');
var Provider = require('../models/provider');
var Transaction = require('../models/transaction')
var Pinbatch = require('../models/pinbatch')
var Pin = require('../models/pindb')
var TriangloPrice = require('../models/triangloprice')
var TransfertoPrice = require('../models/transfertoprice')
var TRTLPrice = require('../models/trtlprice')
var Provmapping = require('../models/provmapping')
var Currency = require('../models/currency')
var CountryHelper = require('../models/countryhelper')
var ProvHelper = require('../models/provhelper')
var Rate = require('../models/rate')
var Withdrawals = require('../models/withdrawal')
var Account = require('../models/account')
var authc = require('../modules/auth');
var moment = require('moment');
var https = require('https');
var Finance = require('../modules/finance');
var jwt = require('jwt-simple');
var s = require('../modules/soapclient')
var Ticket = require('../models/ticket')
var TicketMsg = require('../models/ticketmsg')
var Topuplog = require('../models/topuplog')
var Corestat = require('../models/corestat')
var Apicred = require('../models/apicred')
var ApiSetting = require('../models/apisetting')
var Setting = require('../models/setting')
var nodemailer = require('nodemailer')
var sendMailTR = require('nodemailer-sendmail-transport')
var co = require('co')
var fs = require('fs');
var csv = require('fast-csv');
var multer = require('multer')
var crypto = require('crypto')
var mime = require('mime')
var path = require('path');
var LoginLog = require('../models/loginlog')
//dragon added 2017_11_14
var DailyStats = require('../models/dailycore')
var DayStats = require('../models/daycore')
var WeeklyStats = require('../models/weeklycore')
var WeekStats = require('../models/weekcore')
var MonthlyStats = require('../models/monthlycore')
var MonthStats = require('../models/monthcore')
var YearlyStats = require('../models/yearlycore')
var YearStats = require('../models/yearcore')
var Apibalance = require('../models/apibalance');
var TagStockSummary = require('../models/tagstocksummary');
var DynamicRoute = require('../models/dynamicroute');
var AccountRoute = require('../models/accountroute');
var DynamicRule = require('../models/linkrule');
var FinancialRule = require('../models/routingrule');
var MSISDNCache = require('../models/msisdncache');
var Cache = require('../modules/cache');
var SCCS = require('../models/scc');
var LogEntry = require('../models/logentry');
var XMLog = require('../models/xmlog');
var DailySummary = require('../models/dailysummary');
var s = require('../modules/soapclient');
var RTStats = require('../models/rtstat');
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'tmp/rateimports/')
    },
    filename: function (req, file, cb) {
        crypto.pseudoRandomBytes(16, function (err, raw) {
            cb(null, raw.toString('hex') + Date.now() + '.' + mime.extension(file.mimetype));
        });
    }
});
var upload = multer({storage: storage});
function randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}
function pad(num) {
    var norm = Math.abs(Math.floor(num));
    return (norm < 10 ? '0' : '') + norm;
};
/* GET home page. */
router.get('/version', function (req, res, next) {
    var r = {};
    r.version = process.env.VERSION;
    r.docreference = 'https://' + req.headers.host + '/apidoc/';
    r.time = new Date();
    res.json(r)
});

router.post('/auth', function (req, res) {
    if (!req.body || !req.body.username) return res.sendStatus(500);
    var myAuth = Admin.findOne({username: req.body.username}).exec();
    myAuth.then(
        function (user) {
            if (!user)
                res.sendStatus(401);
            var hp = authc(req.body.password);
            if (hp === user.password) {
                var expires = moment().add(2, 'days').valueOf();
                //update user last_login field
                //console.log('User ID  :', user._id);
                Admin.findOneAndUpdate({_id: user._id}, {$set: {last_login: new Date}}).exec();
                var token = jwt.encode({
                    iss: user._id,
                    exp: expires
                }, req.app.settings.jwtTokenSecret);
                var resObject = {
                    token: token,
                    expires: new Date(expires)
                };
                //return object
                res.json(resObject);
            } else {
                res.sendStatus(401);
            }
        }
    )
        .catch(function (err) {
            console.error(err);
        });
});
/* DR RULES */
router.get('/drules', function (req, res) {
    DynamicRule.find({isSystemWide : true})
        .then(function (app) {
            var r = {
                count: app.length,
                rulesets: app
            }
            res.json(r)
        })
})
router.get('/drules/:id', function (req, res) {
    DynamicRule.findOne({_id: req.params.id})
        .then(function (crd) {
            res.json(crd)
        })
})
router.put('/drules/:id', function (req, res) {

    DynamicRule.findOne({_id: req.params.id})
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
router.post('/drules/', function (req, res) {
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

    o.save(function (err, ob) {
        if (err) {
            res.sendStatus(500)
        } else {
            res.status(201).send(ob);
        }
    })
})
router.delete('/drules/:sid', async (req,res) => {
    var xyx  = await DynamicRule.findOneAndRemove({_id : req.params.sid}).exec();
    res.sendStatus(204);
})
/* DR RULES */
/* FR RULES */
router.get('/frules', function (req, res) {
    FinancialRule.find({isSystemWide : true})
        .then(function (app) {
            var r = {
                count: app.length,
                rulesets: app
            }
            res.json(r)
        })
})
router.get('/frules/:id', function (req, res) {
    FinancialRule.findOne({_id: req.params.id})
        .then(function (crd) {
            res.json(crd)
        })
})
router.put('/frules/:id', function (req, res) {

    FinancialRule.findOne({_id: req.params.id})
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
router.post('/frules/', function (req, res) {
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

    o.save(function (err, ob) {
        if (err) {
            res.sendStatus(500)
        } else {
            res.status(201).send(ob);
        }
    })
})
router.delete('/frules/:sid', async (req,res) => {
    var xyx  = await FinancialRule.findOneAndRemove({_id : req.params.sid}).exec();
    res.sendStatus(204);
})
/* FR RULES */
/* ACLINKS */
router.get('/acclinks', function (req, res) {
    AccountRoute.find()
        .then(function (app) {
            var r = {
                count: app.length,
                accounts: app
            }
            res.json(r)
        })
})
router.get('/acclinks/:id', function (req, res) {
    AccountRoute.findOne({_id: req.params.id})
        .then(function (crd) {
            res.json(crd)
        })
})
router.put('/acclinks/:id', function (req, res) {

    AccountRoute.findOne({_id: req.params.id})
        .then(function (crd) {
            //console.log(crd, req.body);

            var fKeys = ['sourceNumbers', 'isSystemWide', 'srcNum']
            for (var key in req.body) {
                if (fKeys.contains(key)) {
                    continue;
                }
                crd[key] = req.body[key];
            }
            if (req.body.srcNum.indexOf(',') !== '-1') {
                var sa = req.body.srcNum.split(',')
                if (sa.length > 0) {
                    crd.sourceNumbers = [];
                    crd.sourceNumbers = sa;
                }
            }
           

            return crd.save();
        })
        .then(function (tx) {
            res.json(tx)
        })

})
router.post('/acclinks/', function (req, res) {
    var o = new AccountRoute(req.body)
    if (req.body.srcNum.indexOf(',') !== -1) {
        var sa = req.body.srcNum.split(',')
        if (sa.length > 0) {
            o.sourceNumbers = [];
            o.sourceNumbers = sa;
        }
    }
    o.save(function (err, ob) {
        if (err) {
            res.sendStatus(500)
        } else {
            res.status(201).send(ob);
        }
    })
})
router.delete('/acclinks/:sid', async (req,res) => {
    var xyx  = await AccountRoute.findOneAndRemove({_id : req.params.sid}).exec();
    res.sendStatus(204);
})
/* ACLINKS */
/* PORTCACHE */
router.get('/msisdncache', function (req, res) {
    MSISDNCache.find().limit(100)
        .then(function (app) {
            var r = {
                count: app.length,
                cache: app
            }
            res.json(r)
        })
})
router.get('/msisdncache/search/:num', async (req,res) => {
   var a = await MSISDNCache.find({msisdn : new RegExp(req.params.num, 'i')}).limit(100).exec();
    var r = {
        count : a.length,
        cache : a
    }
    res.json(r);
})
router.get('/msisdncache/:id', function (req, res) {
    MSISDNCache.findOne({_id: req.params.id})
        .then(function (crd) {
            res.json(crd)
        })
})
router.put('/msisdncache/:id', function (req, res) {

    MSISDNCache.findOne({_id: req.params.id})
        .then(function (crd) {
            //console.log(crd, req.body);

           
            for (var key in req.body) {
               
                crd[key] = req.body[key];
            }
            return crd.save();
        })
        .then(function (tx) {
            res.json(tx)
        })

})
router.post('/msisdncache/', function (req, res) {
    var o = new MSISDNCache(req.body)
    o.save(function (err, ob) {
        if (err) {
            res.sendStatus(500)
        } else {
            res.status(201).send(ob);
        }
    })
})
router.delete('/msisdncache/:sid', async (req,res) => {
    var xyx  = await MSISDNCache.findOneAndRemove({_id : req.params.sid}).exec();
    res.sendStatus(204);
})
/* PORTCACHE */
router.get('/commlinks', async (req,res) => {
    var aax = await DynamicRoute.find();
    var r = {
        count : aax.length,
        links : aax
    }

    res.json(r);
})
router.post('/commlinks', async (req,res) => {
    var xa=  await new DynamicRoute();
    for (var key in req.body) {
        xa[key] = req.body[key];
    }
    var x = await xa.save();
    res.json(x);
})
router.get('/commlinks/:sid', async (req,res) => {
    var aax = await DynamicRoute.findOne({_id : req.params.sid});
    res.json(aax);
})
router.put('/commlinks/:sid', async (req,res) => {
    var lru = await DynamicRoute.findOne({_id : req.params.sid})
    var fKeys = ['sourceNumbers', 'isSystemWide', 'srcNum', 'updatedAt', 'createdAt', '__v']
            
    for (var key in req.body) {
        if (fKeys.contains(key)) {
                continue;
        }
                
        lru[key] = req.body[key];
    }
    var az = await lru.save();
    res.json(az);
})
router.delete('/commlinks/:sid', async (req,res) => {
    var xyx  = await DynamicRoute.findOneAndRemove({_id : req.params.sid}).exec();
    res.sendStatus(204);
})

router.get('/dashboard_Core_custom/:mode/:customdate', function (req, res) {
    console.log("customDate");
    var strDateList = req.params.customdate.split("-");

    var yy = strDateList[0];
    var mm = strDateList[1];
    var ww = strDateList[2];
    var dd = strDateList[3];

    if (req.params.mode == 'custom_day') {
        yy = parseInt(yy);
        mm = parseInt(mm);
        dd = parseInt(dd);
        
        var off = parseInt(req.query.timezone) || 0;
        off = off - (off % 60);

        var start = new DateWithOffset(yy, mm - 1, dd, off);

        console.log('Custom Date selection');

        DayStats.findOne({"time_from": start.date()}).sort({'time_to': -1})
            .then(function (st) {
                console.log('Custom Date selection DayStat');
                console.log(st);
                res.json(st)
            })
            .catch(function (err) {
                winston.log('error', err);
                res.status(err.status || 500).send(err);
            });
    } else if (req.params.mode == 'custom_week') {
/*        if(mm.length<2){
            mm = '0'+mm;
        }
        var d = new Date(yy,(mm-1));
        d.setDate((ww-1)*7 - d.getDay() + 1);
        dd = (d.getDate() + 8).toString();
        if(dd.length<2){
            dd = '0'+dd;
        }
        var start =new Date(yy+'-'+mm+'-'+dd+'T00:00:00.000Z');
        var end =new Date(yy+'-'+mm+'-'+dd+'T23:59:00.000Z');
*/
        var firstDateOfMonth = new Date(yy, mm - 1, 1); // Date: year-month-01
        var firstDayOfMonth = firstDateOfMonth.getDay();     // 0 (Sun) to 6 (Sat)
        var firstDateOfWeek = new Date(firstDateOfMonth);    // copy firstDateOfMonth

        firstDateOfWeek.setDate(                             // move the Date object
            firstDateOfWeek.getDate() +                      // forward by the number of
            (firstDayOfMonth ? 7 - firstDayOfMonth : 0)      // days needed to go to
        );                                                   // Sunday, if necessary

        firstDateOfWeek.setDate(                             // move the Date object
            firstDateOfWeek.getDate() +                      // forward by the number of
            7 * (ww - 1)                                   // weeks required (week - 1)
        );
        if(mm.length<2){
            mm = '0'+mm;
        }
        day = firstDateOfWeek.getDate().toString();
        if(day.length<2){
            day = '0'+day;
        }
        var start =new Date(yy+'-'+mm+'-'+day+'T00:00:00.000z');
        var end =new Date(yy+'-'+mm+'-'+day+'T01:00:00.000z');
        console.log(start);
        console.log(day);
        console.log(firstDateOfWeek.getDate());

        WeekStats.findOne({"time": {"$gte": start, "$lt": end}})
            .then(function (st) {
                res.json(st)
            })
            .catch(function (err) {
                winston.log('error', err);
                res.status(err.status || 500).send(err);
            });
    } else if (req.params.mode == 'custom_month') {
        var date = new Date(yy,mm,0);
        var daysOfMonth = date.getDate();
        mm = (parseInt(mm)).toString();
        if(mm.length<2){
            mm = '0'+mm;
        }
        var start =new Date(yy+'-'+mm+'-'+daysOfMonth+'T00:00:00.000Z');
        var end =new Date(yy+'-'+mm+'-'+daysOfMonth+'T23:59:59.999Z');
        MonthStats.findOne({"time": {"$gte": start, "$lte": end}})
            .then(function (st) {
                res.json(st)
            })
            .catch(function (err) {
                winston.log('error', err);
                res.status(err.status || 500).send(err);
            });
    } else if (req.params.mode == 'custom_year') {
        var start =new Date((parseInt(yy)).toString()+'-12-31T00:00:00.000Z');
        var end =new Date((parseInt(yy)).toString()+'-12-31T23:59:59.000Z');
        YearStats.findOne({"time": {"$gte": start, "$lt": end}})
            .then(function (st) {
                res.json(st)
            })
            .catch(function (err) {
                winston.log('error', err);
                res.status(err.status || 500).send(err);
            });
    }
})

//dragon added 2017_11_14
router.get('/dashboard_Core/:mode', async function (req, res) {
    var mode = req.params.mode;
    var off = parseInt(req.query.timezone) || 0;
    off = off - (off % 60);

    var ck = 'dcore_' + mode;
    ck = ['today'].indexOf(mode) != -1 ? ck + off : ck;

    var a = await Cache.get('dcore_' + ck);
    if (a !== false) {
        res.json(a);
    } else {
        if (mode == 'daily') {
            DailyStats.findOne({}).sort({time: -1})
                .then(async function (st) {
                    await Cache.set(ck, st, 3000);
                    res.json(st)
                })
                .catch(function (err) {
                    console.log('error', err);
                    res.status(err.status || 500).send(err);
                });
        } else if (mode == 'today') {
            var today = new DateWithOffset(off);
            var start = new DateWithOffset(today.getFullYear(), today.getMonth(), today.getDate(), off);

            DayStats.findOne({time_from: start.date()}).sort({time_to: -1})
                .then(async function (st) {
                    await Cache.set(ck, st, 3000);
                    res.json(st)
                })
                .catch(function (err) {
                    console.log('error', err);
                    res.status(err.status || 500).send(err);
                });
        } else if (mode == 'weekly') {
            WeeklyStats.findOne({}).sort({time: -1})
                .then(async function (st) {
                    await Cache.set(ck, st, 3000);
                    res.json(st)
                })
                .catch(function (err) {
                    console.log('error', err);
                    res.status(err.status || 500).send(err);
                });
        } else if (mode == 'this_week') {
            WeekStats.findOne({}).sort({time: -1})
                .then(async function (st) {
                    await Cache.set(ck, st, 3000);
                    res.json(st)
                })
                .catch(function (err) {
                    console.log('error', err);
                    res.status(err.status || 500).send(err);
                });
        } else if (mode == 'monthly') {
            MonthlyStats.findOne({}).sort({time: -1})
                .then(async function (st) {
                    await Cache.set(ck, st, 3000);
                    res.json(st)
                })
                .catch(function (err) {
                    console.log('error', err);
                    res.status(err.status || 500).send(err);
                });
        } else if (mode == 'this_month') {
            MonthStats.findOne({}).sort({time: -1})
                .then(async function (st) {
                    await Cache.set(ck, st, 3000);
                    res.json(st)
                })
                .catch(function (err) {
                    console.log('error', err);
                    res.status(err.status || 500).send(err);
                });
        } else if (mode == 'yearly') {
            YearlyStats.findOne({}).sort({time: -1})
                .then(async function (st) {
                    await Cache.set(ck, st, 3000);
                    res.json(st)
                    //console.log(st);
                })
                .catch(function (err) {
                    winston.log('error', err);
                    res.status(err.status || 500).send(err);
                });
        } else if (mode == 'this_year') {
            YearStats.findOne({}).sort({time: -1})
                .then(async function (st) {
                    await Cache.set(ck, st, 3000);
                    res.json(st)
                    //console.log(st);
                })
                .catch(function (err) {
                    console.log('error', err);
                    res.status(err.status || 500).send(err);
                });
        }
    }
    //console.log(req.params.mode) ;
})

////////////////////////////////////
router.get('/status', function (req, res) {
    console.log('FUNC-START', new Date())
    var respObject = {};
    //console.log(req.user);
    respObject.expires = new Date(req.user.exp).toISOString();
    respObject.token = req.headers.authorization.split(' ')[1];
    respObject._id = req.user._id;
    respObject.username = req.user.username;
    respObject.first_name = req.user.first_name;
    respObject.last_name = req.user.last_name;
    respObject.account_type = req.user.account_type;
    respObject.main_account = req.user.main_account;
    respObject.access_level = req.user.access_level;
    if (req.user.access_level == 'partner') {
        respObject.partner_tag = req.user.partner_tag;
    }
    console.log('FUNC-END', new Date())
    res.json(respObject);

});
router.get('/tickets/stats', function (req, res) {
    co(function*() {
        var acc = yield Account.findOne({_id: req.user.main_account}).exec();

        var open = yield Ticket.find({status: {$ne: 'closed'}}).count().exec();
        var closed = yield Ticket.find({status: 'closed'}).count().exec();
        var resp = {
            open: open,
            closed: closed
        }
        res.json(resp);
    })
        .catch(function (err) {
            winston.log('error', err);
            res.status(err.status || 500).send(err);
        });
})
router.get('/tickets/:status/:page', function (req, res) {
    var opts = {page: req.params.page, limit: 500, sort: {time: -1}};
    var filter = {}
    if (req.params.status == 'open') {
        filter.status = {$in: ['new', 'open']}
    } else if (req.params.status == 'closed') {
        filter.status = 'closed'
    } else if (req.params.status == 'all') {

    } else {
        var err = {};
        err.code = "UNSUPPORTED_FILTER";
        err.message = "Sorry, we dont support this filter value."
        err.status = 500;
        throw err;
    }
    Ticket.paginate(filter, opts)
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
            //console.log(new Error(err.message));
            res.status(err.status).send(err);
        });

})
router.get('/tickets/:id', function (req, res) {
    Ticket.findOne({_id: req.params.id})
        .then(function (t) {
            //console.log('T', t)
            if (t !== null) {
                res.locals.ticket = t;
                return TicketMsg.find({ticket: t._id}).exec();
            } else {
                var err = {};
                err.status = 404;
                err.code = "TICKET_NOT_FOUND";
                err.message = "Sorry, we cannot find ticket with this ID";
                throw err;
            }
        })
        .then(function (tm) {
            //console.log('TR', res.locals.ticket)
            //console.log('TM', tm)
            var resp = {};
            resp.data = res.locals.ticket;
            resp.messages = tm;

            //console.log('RESP', resp)
            res.json(resp);
        })
})
router.put('/tickets/:id', function (req, res) {
    Ticket.findOne({_id: req.params.id})
        .then(function (tt) {
            res.locals.ticket = tt;
            return Account.findOne({_id: tt.support_account}).exec();
        })
        .then(function (ress) {
            res.reseller = ress;
            return res.locals.ticket;
        })
        .then(function (ticket) {
            var transp = nodemailer.createTransport(sendMailTR({path: '/usr/sbin/sendmail'}));
            for (var key in req.body) {
                if ((key == 'message') || (key == 'created') || (key == 'account') || (key == 'msgcount') || (key == 'closeonreply'))
                    continue;
                ticket[key] = req.body[key];
            }
            if (req.body.closeonreply) {
                ticket.status = 'closed'
            }
            if (req.body.message) {
                var tm = new TicketMsg();
                tm.ticket = ticket._id;
                tm.source = 'web';
                tm.author = req.user._id;
                tm.author_name = req.user.first_name + ' ' + req.user.last_name;

                tm.message = req.body.message;
                tm.created = new Date();
                tm.author_type = 'agent';
                ticket.msgcount++;
                tm.save();
                var text = 'Dear customer,\n' +
                    '\n' +
                    'A response has been received to your request: \n' +
                    'Ticket details:\n' +
                    '\n' +
                    'Ticket ID: [tt #' + res.locals.ticket.ticket_id + ']\n' +
                    'Subject: ' + res.locals.ticket.subject + '\n' +
                    'Status: ' + res.locals.ticket.status + ' \n' +
                    '\n' +
                    req.body.message + '\n' +
                    '\n' +
                    'Kind regards,\n' +
                    'PrimeAirtime Support Team\n';
                User.find({main_account: res.locals.ticket.account}, function (err, ra) {
                    if (err) {
                        throw err;
                    } else {
                        var to = [];
                        ra.forEach(function (uu) {
                            to.push(uu.username);
                        })
                        var mailOpts = {
                            from: '"PrimeAirtime Support Team" <support@primeairtime.com>',
                            to: to,
                            subject: '[tt #' + res.locals.ticket.ticket_id + '] An update received to your ticket ',
                            text: text
                        }
                        //console.log('OP1', mailOpts);
                        transp.sendMail(mailOpts, function (err, inf) {
                            if (err) {
                                //console.log(err);
                            } else {
                                //res.sendStatus(200);
                            }
                        })
                    }
                })
                return ticket.save();
            } else {
                return ticket.save();
            }
        })
        .then(function (ts) {
            res.json(ts)
        })
        .catch(function (err) {
            res.status = err.status || 500;
            //console.log(new Error(err.message));
            res.status(err.status).send(err);
        });
})
router.get('/users', async function (req, res) {
    var a = await Cache.get('ulist');
    if (a !== false) {
        res.json(a);
    } else {
        User.find().exec()
        .then(async function (u) {
            var r = {};
            r.count = u.length;
            r.users = [];
            u.forEach(function (a) {
                r.users.push(a);
            });
            await Cache.set('ulist', r, 3600);
            res.json(r);
        })
        .catch(function (err) {
            res.status = err.status || 500;
            //console.log(new Error(err.message));
            res.json(err.status, err);
        });
    }
   
});
router.get('/users/:uid', function (req, res) {
    User.findOne({_id: req.params.uid}, {password: false})
        .then(function (u) {
            res.json(u);
        })
        .catch(function (err) {
            res.status = err.status || 500;
            //console.log(new Error(err.message));
            res.json(err.status, err);
        });
});
router.put('/users/:uid', function (req, res) {
    User.findOne({_id: req.params.uid})
        .then(function (u) {
            for (key in req.body) {
                if ((key == '_id') || (key == 'updatedAt') || (key == 'createdAt') || (key == 'last_login') || (key == 'username') || (key == 'avatar')) {
                    continue;
                } else if (key == 'password') {
                    //console.log('HASHING PASS to', authc(req.body[key]))
                    u.password = authc(req.body[key]);
                    continue;
                } else {
                    //console.log('key is ', key);
                    u[key] = req.body[key];
                }


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
            //console.log(new Error(err.message));
            res.json(err.status, err);
        });
});
router.delete('/users/:uid', function (req, res) {
    //revoke access
    User.findOne({_id: req.params.uid}).remove().exec();
    res.sendStatus(204);
});
router.get('/scc', async (req,res) => {
    var a = await SCCS.findOne().exec();
    res.json(a);
})
router.get('/operators', async function (req, res) {
    var a = await Cache.get('oplist');
    if (a !== false) {
        res.json(a);
    } else {
        Operator.find()
        .then(async function (dat) {
            var resp = {};
            resp.count = dat.length;
            resp.operators = dat;
            Cache.set('oplist', resp, 86400);
            res.json(resp);
        })
        .catch(function (err) {
            res.status = err.status || 500;
            //console.log(new Error(err.message));
            res.json(err.status, err);
        });
    }
   
})
router.get('/logs/:txkey', async function (req,res) {
   

    var logEntries = await LogEntry.find({txkey : req.params.txkey});
    var tLog = await Topuplog.findOne({txkey : req.params.txkey});
    var xmLog = await XMLog.find({txkey : req.params.txkey});
    
    var r = {
        tlog : tLog,
        xml : xmLog,
        logs : logEntries
    };
    if (tLog !== null) {
        r.related_transactions = [];
        for (var i = 0; i < tLog.related_transactions.length; i++) {
            var tt = await Transaction.findOne({_id : tLog.related_transactions[i]});
            r.related_transactions.push(tt);
        }
    }
    res.json(r);
})
router.get('/operators/:iso', async function (req, res) {
    var a = await Cache.get('opl_' + req.params.iso);
    if (a !== false) {
        res.json(a);
    } else {
        Operator.find({iso: req.params.iso})
        .then(async function (r) {
            var resp = {};
            resp.count = r.length;
            resp.operators = r;
            await Cache.set('opl_' + req.params.iso, resp, 86400);
            res.json(resp);
        })
        .catch(function (err) {
            res.status = err.status || 500;
            //console.log(new Error(err.message));
            res.json(err.status, err);
        });
    }
    
})
router.get('/transactions/transaction', function (req, res) {
    req.body = JSON.parse(new Buffer(req.query.filter, 'base64').toString('ascii'));
    console.log('body', req.body)
    list1 = [];
   var names = [];
    co(function*() {
/*
        var Li1 = yield Account.find({type: 'agent'}).exec();
        for (var i = 0; i < Li1.length; i++) {
            var r = Li1[i];
            var par = yield Account.findOne({_id: r.parent}).exec();
            if (par !== null) {
                list1[r._id] = par.account_name;
            }
           
        }
        */
       return
    })
        .then(async function (xaa) {
            var ob = {};
            var name
            console.log('BOD', req.body);
            if (req.body.account == '') {
                
            } else  {
                var aclist = [];
                var a1 = await Account.findOne({_id : req.body.account});
                if (a1.type == 'reseller') {
                    
                    var ali = await Account.find({parent : a1._id});
                    for (var ix = 0; ix < ali.length; ix++) {
                        aclist.push(ali[ix]._id);
                        names[ali[ix]._id] = ali[ix].account_name;
                    }
                    ob.account = {$in : aclist};
                } else if (a1.type == 'wholesaler') {
                    var a0 = await Account.find({parent : a1._id, type : 'agent'});
                    for (var iz = 0; iz < a0.length ; iz++) {
                        aclist.push(a0[iz]._id);
                        names[a0[iz]._id] = a0[iz].account_name;
                    }
                    var a2 = await Account.find({parent : a1._id, type : 'reseller'});
                    for (var iy = 0; iy < a2.length; iy++) {
                        aclist.push(a2[iy]._id);
                        var a3 = await Account.find({parent : a2[iy]._id, type : 'agent'});
                        for (var ii = 0; ii < a3.length; ii++) {
                            aclist.push(a3[ii]._id);
                            names[a3[ii]._id] = a3[ii].account_name;
                        }
                    }
                    //ob
                    ob.account = {$in : aclist};
                } else {
                    ob.account = req.body.account;
                    names[a1._id] = a1.account_name;
                }
            }
            /*
            if ((req.user.account_type == 'reseller') || (req.user.account_type == 'wholesaler') || (req.user.account_type == 'system')) {
                if ('undefined' !== typeof req.body.account) {
                    if (req.body.account == "all") {
                        ob = {account: {$in: req.user.child}}
                    } else {
                        if (req.user.child.contains(req.body.account)) {
                            ob = {account: req.body.account}
                        } else {
                            ob = {account: req.user.main_account}
                        }
                    }
                } else {
                    ob = {account: {$in: req.user.child}}
                }
            } else if (req.user.account_type == 'agent') {
                ob = {account: req.user.main_account}
            }
            */
            if ((req.body.date_from !== '')) {
                if ('undefined' !== typeof req.body.timezone) {
                    if (req.body.timezone !== '') {
                        var off = offset[req.body.timezone];
                        res.locals.offset = off;

                        if (off < 0) {
                            //var offs = off.replace('-', '')
                            var h = (parseInt(off / 60)) * 1;
                            var m = (off % 60) * 1;
                            var compTZ = String("-" + pad(h) + ":" + pad(m));
                        } else {
                            var h = parseInt(off / 60);
                            var m = off % 60;
                            var compTZ = String("+" + pad(h) + ":" + pad(m));
                        }

                    } else {
                        res.locals.offset = 0;
                        var compTZ = "Z"
                    }
                } else {
                    res.locals.offset = 0;
                    var compTZ = "Z"
                }

                if (req.body.time_from == '') {
                    req.body.time_from = "2017-01-01T00:01:00.000Z"
                }
                if (req.body.time_to == '') {
                    req.body.time_to = "2017-01-01T23:59:59.000Z"
                }
                if (req.body.date_to == '') {
                    req.body.date_to = new Date().toISOString()
                }

                var dfr = req.body.date_from.split("T")[0];
                var tfr = req.body.time_from.split("T")[1].split("Z")[0]
                var dto = req.body.date_to.split("T")[0];
                var tto = req.body.time_to.split("T")[1].split("Z")[0];
                var time_from = new Date(dfr + 'T' + tfr + compTZ);
                var time_to = new Date(dto + 'T' + tto + compTZ);
                ob.time = {$lte: time_to, $gte: time_from}
            }

            var _key = '';
            if ('' !== req.body.type) {
                _key = 'type';
                ob[_key] = req.body.type;
            }
            if ('' !== req.body.currency) {
                _key = 'currency';
                ob[_key] = req.body.currency;
            }
            if ('' !== req.body.wallet_id) {
                _key = 'wallet_id';
                ob[_key] = req.body.wallet_id;
            }
            if ('' !== req.body.description) {
                _key = 'description';
                ob[_key] = new RegExp(req.body.description, 'i');
            }
            if ('' !== req.body.source) {
                _key = 'source';
                ob[_key] = req.body.source;
            }
            if('' !== req.body.transaction_id) {
                _key = '_id';
                ob[_key] = req.body.transaction_id;
            }
            var str = Transaction.find(ob).sort({time: -1}).batchSize(1000000000000).cursor();

            if(req.query.category == 'csv')
            {
                res.writeHead(200, {
                    'Content-Type': 'text/csv',
                    'Access-Control-Allow-Origin': '*',
                    'Content-Disposition': 'attachment; filename=transaction.csv'
                });
                var st = "Transaction_id,Account Name,Time,Type,Amount,Currency,balance_after,Wallet_id,Source,Description\n";
                res.write(st);
                str.on("data", function (d) {
    
                    var mtime = new DateWithOffset(d.time, res.locals.offset || 0).toString()
                    var str = d._id+ ',' + names[d.account] + ',' + mtime  + ',' + d.type+',' + parseFloat(d.amount).toFixed(2) + ',' + d.currency + ','+parseFloat(d.balance_after).toFixed(2) + ',' + d.wallet_id + ',' + d.source + ',' + d.description + '\n';
                    res.write(str);
                })
                str.on("end", function () {
                    res.end();
                })
            }else if(req.query.category == 'txt')
            {
                res.writeHead(200, {
                    'Content-Type': 'text',
                    'Access-Control-Allow-Origin': '*',
                    'Content-Disposition': 'attachment; filename=transaction.txt'
                });
                var st = "Transaction_id,Time,Account Name,Parent,Type,Wallet_id,balance_after,Amount,Currency,Description,Source\n";
                res.write(st);
                str.on("data", function (d) {
    
                    var mtime = new DateWithOffset(d.time, res.locals.offset || 0).toString()
                    var str = d._id+ ',' + names[d.account] + ',' + mtime  + ',' + d.type+',' + parseFloat(d.amount).toFixed(2) + ',' + d.currency + ','+parseFloat(d.balance_after).toFixed(2) + ',' + d.wallet_id + ',' + d.source + ',' + d.description + '\n';
                    res.write(str);
                })
                str.on("end", function () {
                    res.end();
                })
            }else if(req.query.category == 'xlsx')
            {
                var styles = {
                    headerDark: {
                      fill: {
                        fgColor: {
                          rgb: 'FF000000'
                        }
                      },
                      font: {
                        color: {
                          rgb: 'FFFFFFFF'
                        },
                        sz: 11,
                        bold: true,
                        underline: true
                      }
                    },
                    cellPink: {
                      fill: {
                        fgColor: {
                          rgb: 'FFFFCCFF'
                        }
                      }
                    },
                    cellGreen: {
                      fill: {
                        fgColor: {
                          rgb: 'FF00FF00'
                        }
                      }
                    },
                    cellTime: {
                        fill: {
                            numFmt :  "dd/mm/yyyy hh:nn:ss",
                            fgColor: {
                                rgb: 'FF000000'
                              }
                        },
                        font: {
                            color: {
                              rgb: 'FFFFFFFF'
                            },
                            sz: 11,
                            bold: true,
                            underline: true
                          }
                    }
                  };
                
    
                var specification = {
                    Transaction_id: { // <- the key should match the actual data key
                      displayName: 'Transaction_id', // <- Here you specify the column header
                      headerStyle: styles.headerDark,
                      width : '30'
                    },
                    Time: {
                        displayName: 'Time',
                        headerStyle: styles.cellTime,
                        width : '30'
                    },
                    Account_Name: {
                      displayName: 'Account Name',
                      headerStyle: styles.headerDark,
                      width: '20' // <- width in chars (when the number is passed as string)
                    },
                    Parent: {
                      displayName: 'Parent',
                      headerStyle: styles.headerDark,
                      width: '20' 
                    },
                    Type: {
                      displayName: 'Type',
                      headerStyle: styles.headerDark,
                      width: '20' 
                    },
                    Wallet_id: {
                      displayName: 'Wallet_id',
                      headerStyle: styles.headerDark,
                      width: '30' 
                    },
                    Balance_after: {
                      displayName: 'Balance_after',
                      headerStyle: styles.headerDark,
                      width: '20' 
                    },
                    Amount: {
                      displayName: 'Amount',
                      headerStyle: styles.headerDark,
                      width: '20' 
                    },
                    Currency: {
                      displayName: 'Currency',
                      headerStyle: styles.headerDark,
                      width: '15' 
                    },
                    Description: {
                      displayName: 'Description',
                      headerStyle: styles.headerDark,
                      width: '50' 
                    },
                    Source: {
                      displayName: 'Source',
                      headerStyle: styles.headerDark,
                      width: '20' 
                    }
                  }
                var dataset = [];
                str.on("data", function (d) {
                    var row = {};
                    row.Transaction_id = d._id ;
                    row.Account_Name = names[d.account];
                    row.Time = new Date(d.time.getTime() + res.locals.offset * 60 * 1000 );
//                    row.Parent = list1[d.account] ;
                    row.Type = d.type ;
                    row.Amount = parseFloat(d.amount).toFixed(2) ;
                    row.Currency = d.currency ;
                    row.Balance_after = parseFloat(d.balance_after).toFixed(2);
                    row.Wallet_id = d.wallet_id;
                    row.Source = d.source ;
                    row.Description = d.description ;
                    dataset.push(row);
                })
                str.on("end", function () {
                    var report = excel.buildExport(
                        [ // <- Notice that this is an array. Pass multiple sheets to create multi sheet report
                          {
                            name: 'transaction', // <- Specify sheet name (optional)
                            specification: specification, // <- Report specification
                            data: dataset // <-- Report data
                          }
                        ]
                      );
                    res.attachment('transaction.xls');
                    res.send(report);
                })
            }else{

            }
           
        })

})
router.get('/transactions/:page', function (req, res) {
    var opts = {page: req.params.page, limit: 100, sort: {time: -1}};
    Transaction.paginate({}, opts)
        .then(async function (f) {
            
            var al = await Account.find({}, {account_name : true});
            var rwn = [];
            for (var i =0; i < al.length ; i++) {
                rwn[al[i]._id] = al[i].account_name;
            }
            var docs = [];
            for (var i2 = 0; i2 < f.docs.length ; i2++) {
        //        f.docs[i2].account_name = rwn[f.docs[i2].account];
                var doc = f.docs[i2].toObject();
                doc.account_name = rwn[f.docs[i2].account]
                docs.push(doc);
            }
         /*
            f.docs.forEach(function (fr) {
                var doc = fr.toObject();
                doc.account_name = req.user.rwnames[fr.account];
                docs.push(doc)
            })
            */
            var o = {};
            o.count = f.total;
            o.pages = f.pages;
            o.page = f.page;
            o.limit = f.limit;
            o.docs = docs;
            res.json(o);
        })
        .catch(function (err) {
       //     res.status = err.status || 500;
            console.log(err);
          res.status(err.status ||500).send(err);
        });
})
router.get('/provmap/entry/:id', function (req, res) {
    Provmapping.findOne({_id: req.params.id})
        .then(function (pr) {
            res.json(pr)
        })
        .catch(function (err) {
            res.status = err.status || 500;
            //console.log(new Error(err.message));
            res.json(err.status, err);
        });
})
router.put('/provmap/entry/:id', function (req, res) {
    Provmapping.findOne({_id: req.params.id})
        .then(function (pr) {
            for (var key in req.body) {
                pr[key] = req.body[key];
            }
            return pr.save();
        })
        .then(function (pp) {
            res.json(pp);
        })
        .catch(function (err) {
            res.status = err.status || 500;
            //console.log(new Error(err.message));
            res.json(err.status, err);
        });
})
router.post('/provmap/entry', function (req, res) {
    var map = new Provmapping();
    map.iso = req.body.iso;
    map.country = req.body.country;
    map.operator_name = req.body.operator_name;
    map.trt_id = req.body.trt_id;
    map.trl_id = req.body.trl_id;
    map.save();
    res.sendStatus(201);
})
router.delete('/provmap/entry/:id', function (req, res) {
    Provmapping.find({_id: req.params.id}).remove()
        .then(function (re) {
            res.sendStatus(204);
        })
        .catch(function (err) {
            res.status = err.status || 500;
            //console.log(new Error(err.message));
            res.json(err.status, err);
        });
})
router.get('/provmap/:page', function (req, res) {
    var opts = {page: req.params.page, limit: 500, sort: {iso: 1}};
    Provmapping.paginate({}, opts)
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
            //console.log(new Error(err.message));
            res.json(err.status, err);
        });
})

router.get('/pins', function (req, res) {
    Pinbatch.find().sort({createdAt: -1})
        .then(function (pi) {
            var re = {};
            re.count = pi.length;
            re.batches = pi;
            res.json(re);
        })
        .catch(function (err) {
            res.status = err.status || 500;
            //console.log(new Error(err.message));
            res.json(err.status, err);
        });
})
router.post('/pins/search', function (req, res) {
    co(function*() {
        //console.log(req.body.pin)
        var pin = yield Pin.find({$or: [{serial: req.body.pin}, {code: req.body.pin}, {topup_destination: req.body.pin}, {caller_id: req.body.pin}, {'tries.caller_id': req.body.pin}, {'tries.topup_number': req.body.pin}]}).exec();
        if (pin !== null) {
            //we have pin 
            var entries = [];
            for (var i = 0; i < pin.length; i++) {
                var p = pin[i];
                var pb = yield Pinbatch.findOne({_id: p.batch}).exec();
                if (pb !== null) {
                    var po = {
                        _id: p._id,
                        seq: p.seq,
                        code: p.code,
                        serial: p.serial,
                        valid: p.valid,
                        batch_valid: pb.valid,
                        batch_id: pb._id,
                        value: p.value,
                        currency: p.currency,
                        issued: p.issued,
                        allocated_to: pb.allocated_to,
                        valid_from: p.valid_from,
                        valid_to: p.valid_to,
                        used: p.used || false,
                        used_date: p.used_date || null,
                        topup_destination: p.topup_destination || null,
                        topup_amount: p.topup_amount || null,
                        topup_currency: p.topup_currency || null,
                        caller_id: p.caller_id || null,
                        channel: p.channel || null,
                        type: pb.type,
                        tries: p.tries
                    }
                    //console.log(po);
                    entries.push(po)
                }
            }

            var r = {};
            r.count = entries.length;
            r.entries = entries;
            res.json(r);


        } else {
            var err = {}
            err.code = "PIN_NOTFOUND"
            err.status = 404;
            err.message = "Sorry i cannot find PIN with these parameters"
            throw err;
        }
    })
        .catch(function (err) {
            res.status(err.status || 500).send(err);
        })
})

router.get('/pins/all/:page' , function (req,res) {
    var opts = {page: req.params.page, limit: 500, sort: {updatedAt: -1}};
    Pin.paginate({}, opts)
        .then(function (f) {
            co(function*() {
                var entries = [];
                
                for (var i = 0; i < f.docs.length; i++) {
                    var p = f.docs[i];
                    var pb = yield Pinbatch.findOne({_id: p.batch}).exec();
                    if (pb !== null) {
                        var callerid = '';
                        var topup_number = '';
                        if(p.tries!= '')
                        {
                            callerid = p.tries[0].caller_id ;
                            topup_number = p.tries[0].topup_number ;
                        }
                        var po = {
                            _id: p._id,
                            seq: p.seq,
                            code: p.code,
                            serial: p.serial,
                            valid: p.valid,
                            batch_valid: pb.valid,
                            batch_id: pb._id,
                            value: p.value,
                            currency: p.currency,
                            issued: p.issued,
                            allocated_to: pb.allocated_to,
                            valid_from: p.valid_from,
                            valid_to: p.valid_to,
                            used: p.used || false,
                            used_date: p.used_date || null,
                            topup_destination: p.topup_destination || null,
                            topup_amount: p.topup_amount || null,
                            topup_currency: p.topup_currency || null,
                            topupnumber: topup_number || null,
                            caller_id: callerid || null,
                            channel: p.channel || null,
                            type: pb.type,
                            tries: p.tries
                        }
                        entries.push(po)
                    }
                }
                var o = {};
                o.count = f.total;
                o.pages = f.pages;
                o.page = f.page;
                o.limit = f.limit;
                o.entries = entries;
                res.json(o);
            })
            .catch(function (err) {
                res.status = err.status || 500;
                //console.log("pagination ----------- " , new Error(err.message));
                res.json(err.status, err);
            })
        })
        .catch(function (err) {
            res.status = err.status || 500;
            //console.log(new Error(err.message));
            res.json(err.status, err);
        });
})

router.post('/pins/filter/:page' , function (req,res) {
    var opts = {page: req.params.page, limit: 500, sort: {updatedAt: -1}};
    var ob = {};
    if ('' !== req.body.callerID) {
        ob = {
            'tries.caller_id' : req.body.callerID
        };
    }
    if ('' !== req.body.topupnumber) {
        ob = {
            'tries.topup_number' : req.body.topupnumber
        };
    }
    if ((req.body.date_from !== '')) {
        if ('undefined' !== typeof req.body.timezone) {
            if (req.body.timezone !== '') {
                var off = offset[req.body.timezone];
                res.locals.offset = off;

                if (off < 0) {
                    var h = (parseInt(off / 60)) * 1;
                    var m = (off % 60) * 1;
                    var compTZ = String("-" + pad(h) + ":" + pad(m));
                } else {
                    var h = parseInt(off / 60);
                    var m = off % 60;
                    var compTZ = String("+" + pad(h) + ":" + pad(m));
                }

            } else {
                res.locals.offset = 0;
                var compTZ = "Z"
            }
        } else {
            res.locals.offset = 0;
            var compTZ = "Z"
        }
        if (req.body.time_from == '') {
            req.body.time_from = "2017-01-01T00:00:00.000Z"
        }
        if (req.body.time_to == '') {
            req.body.time_to = "2017-01-01T23:59:59.000Z"
        }
        if (req.body.date_to == '') {
            req.body.date_to = new Date().toISOString();
        }
        var dfr = req.body.date_from.split("T")[0];
        var tfr = req.body.time_from.split("T")[1].split("Z")[0]
        var dto = req.body.date_to.split("T")[0];
        var tto = req.body.time_to.split("T")[1].split("Z")[0];
        //console.log('TFR', dfr + 'T' + tfr + compTZ)
        var time_from = new Date(dfr + 'T' + tfr + compTZ);
        var time_to = new Date(dto + 'T' + tto + compTZ);
        ob.used_date = {$lte: time_to, $gte: time_from}
    }

    var _key = '';
    if ('' !== req.body.serial) {
        _key = 'serial';
        ob[_key] = req.body.serial;
    }
    if ('' !== req.body.currency) {
        _key = 'currency';
        ob[_key] = req.body.currency;
    }
    if ('' !== req.body.pin) {
        _key = 'code';
        ob[_key] = req.body.pin;
    }
    if ('' !== req.body.valid) {
        _key = 'valid';
        ob[_key] = req.body.valid;
    }
    if ('' !== req.body.value) {
        _key = 'value';
        ob[_key] = req.body.value;
    }
    if ('' !== req.body.used) {
        _key = 'used';
        if(req.body.used == 'true')
            ob[_key] = req.body.used;
        else
            ob[_key] = { $ne: true };
    }
    //console.log(ob);
    Pin.paginate(ob, opts)
        .then(function (f) {
            co(function*() {
                var entries = [];
                for (var i = 0; i < f.docs.length; i++) {
                    var p = f.docs[i];
                    var query_batch = {
                    };
                    if(req.body.type != '')
                    {
                        query_batch = {
                            _id: p.batch,
                            type: req.body.type 
                        }
                    }else{
                        query_batch = {
                            _id: p.batch
                        }
                    }
                    var pb = yield Pinbatch.findOne(query_batch).exec();
                    if (pb !== null) {
                        var useddate = '';
                        if ('undefined' !== typeof res.locals.offset)
                        {
                            useddate = new DateWithOffset(p.used_date, res.locals.offset || 0).toString();
                        }
                        else{
                            useddate =  p.used_date ;
                        }
                        var callerid = '';
                        var topup_number = '';
                        if(p.tries!= '')
                        {
                            callerid = p.tries[0].caller_id ;
                            topup_number = p.tries[0].topup_number ;
                        }
                        var po = {
                            _id: p._id,
                            seq: p.seq,
                            code: p.code,
                            serial: p.serial,
                            valid: p.valid,
                            batch_valid: pb.valid,
                            batch_id: pb._id,
                            value: p.value,
                            currency: p.currency,
                            issued: p.issued,
                            allocated_to: pb.allocated_to,
                            valid_from: p.valid_from,
                            valid_to: p.valid_to,
                            used: p.used || false,
                            used_date: useddate || null,
                            topup_destination: p.topup_destination || null,
                            topup_amount: p.topup_amount || null,
                            topup_currency: p.topup_currency || null,
                            topupnumber : topup_number || null,
                            caller_id: callerid || null,
                            channel: p.channel || null,
                            type: pb.type,
                            tries: p.tries
                        }
                        entries.push(po)
                    }
                }
                var o = {};
                o.count = f.total;
                o.pages = f.pages;
                o.page = f.page;
                o.limit = f.limit;
                o.entries = entries;
                o.filter = new Buffer(JSON.stringify(req.body)).toString('base64');
                res.json(o);
            })
            .catch(function (err) {
                res.status = err.status || 500;
                //console.log("pagination ----------- " , new Error(err.message));
                res.json(err.status, err);
            })
        })
        .catch(function (err) {
            res.status = err.status || 500;
            res.json(err.status, err);
        });
})
router.post('/pins/relatedtopup' , function(req,res){
    Topuplog.find({ target : req.body.topupnumber})
    .then(function(topups){
        res.json(topups);
    })
    .catch(function (err) {
        res.status = err.status || 500;
        res.json(err.status, err);
    });
})
router.post('/pins/relatedtransaction' , function(req,res){
    //console.log(req.body.ids);
    Transaction.find({ _id : {$in: req.body.ids}} )
    .then(function(transaction){
        res.json(transaction);
    })
    .catch(function (err) {
        res.status = err.status || 500;
        res.json(err.status, err);
    });
})
router.get('/pin/:id', function (req, res) {
    co(function*() {
        var pin = yield Pin.findOne({_id: req.params.id}).exec();
        if (pin !== null) {
            var pb = yield Pinbatch.findOne({_id: pin.batch}).exec();
            if (pb !== null) {
                var po = {
                    _id: pin._id,
                    seq: pin.seq,
                    code: pin.code,
                    serial: pin.serial,
                    valid: pin.valid,
                    batch_valid: pb.valid,
                    batch_id: pb._id,
                    value: pin.value,
                    currency: pin.currency,
                    issued: pin.issued,
                    allocated_to: pb.allocated_to,
                    valid_from: pin.valid_from,
                    valid_to: pin.valid_to,
                    used: pin.used || false,
                    used_date: pin.used_date || null,
                    topup_destination: pin.topup_destination || null,
                    topup_amount: pin.topup_amount || null,
                    topup_currency: pin.topup_currency || null,
                    caller_id: pin.caller_id || null,
                    channel: pin.channel || null,
                    type: pb.type,
                    tries: pin.tries
                }
                res.json(po);
            } else {
                var err = {}
                err.code = "PIN_NOTFOUND"
                err.status = 404;
                err.message = "Sorry i cannot find PIN with these parameters"
                throw err;
            }
        } else {
            var err = {}
            err.code = "PIN_NOTFOUND"
            err.status = 404;
            err.message = "Sorry i cannot find PIN with these parameters"
            throw err;
        }
    })
        .catch(function (err) {
            res.status(err.status || 500).send(err);
        })
})
router.post('/pins', function (req, res) {
    if (!req.body.name || !req.body.count || !req.body.value || !req.body.currency || !req.body.valid_from || !req.body.valid_to) {
        var err = {};
        err.code = 'EMISSING_REQUIRED';
        err.message = 'You have not supplied required fields!';
        err.status = 418;
        throw err;
    } else {
        var pb = new Pinbatch();
        pb.name = req.body.name;
        pb.count = req.body.count;
        pb.value = req.body.value;
        pb.currency = req.body.currency;
        pb.valid_from = req.body.valid_from;
        pb.valid = true;
        pb.valid_to = req.body.valid_to;
        pb.description = req.body.description;
        pb.allocated_to = req.body.allocated_to;
        pb.type = req.body.type;
        pb.numseq = randomIntFromInterval(11111111, 99999999)
        pb.issuer = req.user._id;
        pb.save(function (err, repl) {
            if (err) {
                throw err;
            } else {
                for (i = 1; i < pb.count; i++) {
                    var p1 = randomIntFromInterval(11111111, 99999999);
                    var p2 = randomIntFromInterval(11111111, 99999999);
                    var p3 = randomIntFromInterval(11111111, 99999999);
                    var p4 = randomIntFromInterval(11111111, 99999999);
                    var serial = String(p1) + String(p2);
                    var pin = String(p3) + String(p4);
                    //console.log('serial :', serial, ' pin :', pin, ' batch :', repl._id);
                    var p = new Pin();
                    p.valid = true;
                    p.batch = repl._id;
                    p.valid_from = repl.valid_from;
                    p.valid_to = repl.valid_to;
                    p.serial = serial;
                    p.seq = String(pb.numseq) + '-' + i;
                    p.code = pin;
                    p.issued = new Date();
                    p.value = repl.value;
                    p.currency = repl.currency;
                    p.save();
                }
                res.sendStatus(200);
            }
        });
    }
})

router.get('/pins/download/:batch.csv', function (req, res) {
    Pinbatch.findOne({_id: req.params.batch})
        .then(function (ba) {
            //console.log('got it')
            var str = Pin.find({batch: ba._id}).cursor();
            var filename = req.params.batch + '.txt';
            res.writeHead(200, {
                'Content-Type': 'text/csv',
                'Access-Control-Allow-Origin': '*',
                'Content-Disposition': 'attachment; filename=' + filename
            });
            var st = "#,Type,Batch ID,Serial,Code,Value,Currency,Valid,Valid From, Valid To\n";
            res.write(st);
            str.on("data", function (d) {
                var stri = d.seq + ',' + ba.type + ',' + d.batch + ',' + d.serial + ',' + d.code + ',' + d.value + ',' + d.currency + ',' + d.valid + ',' + d.valid_from + ',' + d.valid_to + '\n';
                res.write(stri);
            })
            str.on("end", function () {
                res.end();
            })


        })
        .catch(function (err) {
            throw err;
        })
})
router.get('/pins/:batch', function (req, res) {
    Pinbatch.findOne({_id: req.params.batch})
        .then(function (b) {
            res.locals.batchinfo = b;
            return Pin.find({batch: b._id})
        })
        .then(function (r) {
            var re = {};
            re.count = r.length;
            re.pins = r;
            re.batchinfo = res.locals.batchinfo;
            res.json(re);
        })
        .catch(function (err) {
            res.status = err.status || 500;
            //console.log(new Error(err.message));
            res.json(err.status, err);
        });
});

router.get('/pins/:batch/invalidate', function (req, res) {
    Pinbatch.findOne({_id: req.params.batch})
        .then(function (pi) {
            pi.valid = false;
            pi.save(function (err, r) {
                Pin.update({batch: req.params.batch}, {valid: false}, {multi: true}, function (err, r) {
                    if (err) {
                        throw err;
                    } else {
                        res.sendStatus(200);
                    }
                })
            })
        })
        .catch(function (err) {
            res.status = err.status || 500;
            //console.log(new Error(err.message));
            res.json(err.status, err);
        });
})
router.get('/pins/:batch/:pin/:status', function (req, res) {
    Pin.findOne({batch: req.params.batch, _id: req.params.pin})
        .then(function (pi) {
            pi.valid = req.params.status;
            pi.save(function (err, resp) {
                if (err) {
                    throw err;
                } else {
                    res.sendStatus(200);
                }
            })
        })
        .catch(function (err) {
            res.status = err.status || 500;
            //console.log(new Error(err.message));
            res.json(err.status, err);
        });
})
router.get('/providers', async function (req, res) {
    var ob = {};
    if (req.user.access_level == 'partner') {
        ob.tag = req.user.partner_tag;
    }
    TagStockSummary.find(ob)
        .then(async function (x) {
            var aa = {count : x.length, providers : x};
            await Cache.set('tstocksummary', aa, 3600);
            res.json(aa)
        })
    
})
/*
router.get('/providers', function (req, res) {
    Provider.find()
        .then(function (prov) {
            var resp = {};
            resp.count = prov.length;
            resp.providers = prov;
            res.json(resp);
        })
        .catch(function (err) {
            res.status = err.status || 500;
            //console.log(new Error(err.message));
            res.json(err.status, err);
        });
})
*/
router.get('/providers/:id/ping', function (req, res) {
    Provider.findOne({_id: req.params.id})
        .then(function (p) {
            res.locals.p = p;
            return s.ping(p.provider_code);
        })
        .then(function (re) {
            res.json({status: 'online'});
        })
        .catch(function (err) {
            res.status = err.status || 500;
            //console.log(new Error(err.message));
            res.json(err.status, err);
        });
})
router.get('/operators/:id', function (req, res) {
    Operator.find({_id: req.params.id})
        .then(function (op) {
            res.json(op);
        })
        .catch(function (err) {
            res.status = err.status || 500;
            //console.log(new Error(err.message));
            res.json(err.status, err);
        });
})
router.get('/rates', async function (req, res) {
    var a = await Cache.get('ratelist');
    if (a !== false) {
        res.json(a);
    } else {
        Rate.find()
        .then(async function (r) {
            var ra = {};
            ra.count = r.length;
            ra.rates = r;
            await Cache.set('ratelist', ra, 86400);
            res.json(ra)
        })
        .catch(function (err) {
            res.status = err.status || 500;
            //console.log(new Error(err.message));
            res.json(err.status, err);
        });
    }
    
})
router.post('/rates', function (req, res) {
    if (!req.body.source || !req.body.destination || !req.body.rate) {
        var err = {};
        err.code = 'EMISSING_REQUIRED';
        err.message = 'You have not supplied required fields!';
        err.status = 418;
        throw err;
    } else {
        Rate.findOne({source: req.body.source, destination: req.body.destination})
            .then(function (rate) {
                if (rate !== null) {
                    var err = {};
                    err.message = 'Rate already exists!';
                    err.status = 409;
                    throw err;
                } else {
                    //we don't have it'
                    var r = new Rate();
                    r.source = req.body.source;
                    r.destination = req.body.destination;
                    r.rate = req.body.rate;
                    r.dynamic = false;
                    return r.save();
                }
            })
            .then(function (re) {
                res.json(201, re);
            })
            .catch(function (err) {
                res.status = err.status || 500;
                //console.log(new Error(err.message));
                res.json(err.status, err);
            });
    }

})
router.get('/rates/:id', function (req, res) {
    Rate.findOne({_id: req.params.id})
        .then(function (ra) {
            res.json(ra);
        })
        .catch(function (err) {
            res.status = err.status || 500;
            //console.log(new Error(err.message));
            res.json(err.status, err);
        });
})
router.put('/rates/:id', function (req, res) {
    Rate.findOne({_id: req.params.id}).exec()
        .then(function (acc) {
            for (var key in req.body) {
                var forbiddenKeys = ['source', 'destination', '_id', 'createdAt', 'updatedAt', '__v', 'dynamic'];
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
})
router.delete('/rates/:id', function (req, res) {
    Rate.find({_id: req.params.id}).remove().exec();
    res.sendStatus(204);
})

router.post('/pricetables/:prov/import', upload.single('rate'), function (req, res) {
    switch (req.params.prov) {
        case "TRTO":
            //console.log('Updating TransferTo Prices');
            if (req.file.filename) {
                //remove old data....
                TransfertoPrice.find().remove().exec();
                //parse CSV
                //console.log('GOT RATES :', req.file.path);
                fs.createReadStream(req.file.path)
                    .pipe(csv())
                    .on('data', function (data) {
                        var o = {};
                        o.country = data[0];
                        o.operator_name = data[3];
                        o.operator_id = data[2];
                        o.denomination = data[5];
                        o.currency = data[4];
                        o.unit_cost = data[7];
                        o.active = true;
                        r = new TransfertoPrice(o);
                        r.save();
                    })
                    .on('end', function (data) {
                        //console.log('Read FIN');
                        res.sendStatus(200);
                    });
                //
            } else {
                //console.log('no file input');
                res.sendStatus(500);
            }
            break;
        case "TRLO":
            //console.log('Updating Tranglo Prices');
            if (req.file.filename) {
                //remove old data....
                TriangloPrice.find().remove().exec();
                //parse CSV
                //console.log('GOT RATES :', req.file.path);
                fs.createReadStream(req.file.path)
                    .pipe(csv())
                    .on('data', function (data) {
                        var o = {};
                        o.country = data[1];
                        o.operator_name = data[2];
                        o.operator_id = data[0];
                        o.min_denomination = data[4];
                        o.max_denomination = data[5];
                        o.step = data[6];
                        o.currency = data[3];
                        o.unit_cost = data[7];
                        o.rate = data[8];
                        o.active = true;
                        r = new TriangloPrice(o);
                        r.save();
                    })
                    .on('end', function (data) {
                        //console.log('Read FIN');
                        res.sendStatus(200);
                    });
                //
            } else {
                //console.log('no file input');
                res.sendStatus(500);
            }
            break;
        case "TRTL":
            //console.log('Updating Tranglo Prices');
            if (req.file.filename) {
                //remove old data....
                TRTLPrice.find().remove().exec();
                //parse CSV
                //console.log('GOT RATES :', req.file.path);
                fs.createReadStream(req.file.path)
                    .pipe(csv())
                    .on('data', function (data) {
                        var o = {};
                        o.country = data[1];
                        o.operator_name = data[2];
                        o.operator_id = data[3];
                        o.skuid = data[0]
                        o.currency = data[5]
                        o.min_denomination = data[7];
                        o.max_denomination = data[8];
                        o.step = 1;
                        o.currency = data[5];

                        o.rate = data[9];
                        o.active = true;
                        r = new TRTLPrice(o);
                        r.save();
                    })
                    .on('end', function (data) {
                        //console.log('Read FIN');
                        res.sendStatus(200);
                    });
                //
            } else {
                //console.log('no file input');
                res.sendStatus(500);
            }
            break;
        default:
            res.sendStatus(500);
    }
});

router.post('/transactions/:page', async function (req, res) {
    if (req.user.access_level == 'partner') {
        res.sendStatus(403);
    }
    var opts = {page: req.params.page, limit: 100, sort: {time: -1}};
    var ob = {};
    console.log('BOD', req.body);
    if (req.body.account == '') {
        
    } else if (req.body.account == 'all') {
    } else  {
        var aclist = [];
        var a1 = await Account.findOne({_id : req.body.account});
        if (a1.type == 'reseller') {
            
            var ali = await Account.find({parent : a1._id});
            for (var ix = 0; ix < ali.length; ix++) {
                aclist.push(ali[ix]._id);
            }
            ob.account = {$in : aclist};
        } else if (a1.type == 'wholesaler') {
            var a0 = await Account.find({parent : a1._id, type : 'agent'});
            for (var iz = 0; iz < a0.length ; iz++) {
                aclist.push(a0[iz]._id);
            }
            var a2 = await Account.find({parent : a1._id, type : 'reseller'});
            for (var iy = 0; iy < a2.length; iy++) {
                aclist.push(a2[iy]._id);
                var a3 = await Account.find({parent : a2[iy]._id, type : 'agent'});
                for (var ii = 0; ii < a3.length; ii++) {
                    aclist.push(a3[ii]._id);
                }
            }
            //ob
            ob.account = {$in : aclist};
        } else {
            ob.account = req.body.account;
        }
    }
    /*
    if ((req.user.account_type == 'reseller') || (req.user.account_type == 'wholesaler') || (req.user.account_type == 'system')) {
        if ('undefined' !== typeof req.body.account) {
            if (req.body.account == "all") {
                ob = {};
            } else {
                if (req.user.child.contains(req.body.account)) {
                    ob = {account: req.body.account}
                } else {
                    ob = {account: req.user.main_account}
                }

            }
        } else {
            ob = {}
        }


    } else if (req.user.account_type == 'agent') {
        ob = {account: req.user.main_account}
    }
*/
    if ((req.body.date_from !== '')) {
        if ('undefined' !== typeof req.body.timezone) {
            if (req.body.timezone !== '') {
                var off = offset[req.body.timezone];
                res.locals.offset = off;

                if (off < 0) {
                    var h = (parseInt(off / 60)) * 1;
                    var m = (off % 60) * 1;
                    var compTZ = String("-" + pad(h) + ":" + pad(m));
                } else {
                    var h = parseInt(off / 60);
                    var m = off % 60;
                    var compTZ = String("+" + pad(h) + ":" + pad(m));
                }

            } else {
                res.locals.offset = 0;
                var compTZ = "Z"
            }
        } else {
            res.locals.offset = 0;
            var compTZ = "Z"
        }

        if (req.body.time_from == '') {
            req.body.time_from = "2017-01-01T00:01:00.000Z"
        }
        if (req.body.time_to == '') {
            req.body.time_to = "2017-01-01T23:59:59.000Z"
        }
        if (req.body.date_to == '') {
            req.body.date_to = new Date().toISOString()
        }
        var dfr = req.body.date_from.split("T")[0];
        var tfr = req.body.time_from.split("T")[1].split("Z")[0]
        var dto = req.body.date_to.split("T")[0];
        var tto = req.body.time_to.split("T")[1].split("Z")[0];
        //console.log('TFR', dfr + 'T' + tfr + compTZ)
        //console.log('TTO', dto + 'T' + tto + compTZ)
        var time_from = new Date(dfr + 'T' + tfr + compTZ);
        var time_to = new Date(dto + 'T' + tto + compTZ);
        ob.time = {$lte: time_to, $gte: time_from}
    }

    var _key = '';
    if ('' !== req.body.type) {
        _key = 'type';
        ob[_key] = req.body.type;
    }
    if ('' !== req.body.currency) {
        _key = 'currency';
        ob[_key] = req.body.currency;
    }
    if ('' !== req.body.wallet_id) {
        _key = 'wallet_id';
        ob[_key] = req.body.wallet_id;
    }
    if ('' !== req.body.description) {
        _key = 'target';
        ob[_key] = req.body.description;
    }
    if ('' !== req.body.source) {
        _key = 'source';
        ob[_key] = req.body.source;
    }
    if ('' !== req.body.transaction_id) {
        _key = '_id';
        ob[_key] = req.body.transaction_id;
    }
    console.log('OB-DEBUG', ob);
    Transaction.paginate(ob, opts)
        .then(async function (f) {
            var docs = [];
/*
            f.docs.forEach(function (fr) {
                var tmp = {};
                if ('undefined' !== typeof res.locals.offset)
                {
                    tmp.time = new DateWithOffset(fr.time, res.locals.offset || 0).toString()
                }
                else
                    tmp.time = fr.time
                tmp.account = fr.account;
                tmp.type = fr.type;
                tmp.wallet_id = fr.wallet_id;
                tmp.balance_after = fr.balance_after;
                tmp.amount = fr.amount;
                tmp.currency = fr.currency;
                tmp.description = fr.description;
                tmp.source = fr.source;
                tmp._id = fr._id;
                tmp.account_name = req.user.rwnames[tmp.account];
                arr.push(tmp)
            })
            */
           var al = await Account.find({}, {account_name : true});
           var rwn = [];
           for (var i =0; i < al.length ; i++) {
               rwn[al[i]._id] = al[i].account_name;
           }
           var docs = [];
           for (var i2 = 0; i2 < f.docs.length ; i2++) {
       //        f.docs[i2].account_name = rwn[f.docs[i2].account];
               var doc = f.docs[i2].toObject();
               doc.account_name = rwn[f.docs[i2].account]
               if ('undefined' !== typeof res.locals.offset)
               {
                   doc.time = new DateWithOffset(doc.time, res.locals.offset || 0).toString()
               }   
               docs.push(doc);
           }
            var o = {};
            o.count = f.total;
            o.pages = f.pages;
            o.page = f.page;
            o.limit = f.limit;
            o.docs = docs;
            o.filter = new Buffer(JSON.stringify(req.body)).toString('base64');
            res.json(o);
        })
        .catch(function (err) {
            var st = err.status || 500;
            console.log('error', err);
            res.status(st).send(err);
        });
})
/*
router.get('/transactions/:page', function (req, res) {
    var opts = {page: req.params.page, limit: 500, sort: {time: -1}};
    Transaction.paginate({}, opts)
        .then(function (f) {
            var arr = []

            f.docs.forEach(function (fr) {
                var tmp = {}
                tmp.time = fr.time;
                tmp.account = fr.account;
                tmp.type = fr.type;
                tmp.wallet_id = fr.wallet_id
                tmp.balance_after = fr.balance_after
                tmp.amount = fr.amount;
                tmp.currency = fr.currency;
                tmp.description = fr.description;
                tmp.source = fr.source;
                tmp._id = fr._id;
                tmp.account_name = req.user.rwnames[tmp.account];
                arr.push(tmp)
            })
            var o = {};
            o.count = f.total;
            o.pages = f.pages;
            o.page = f.page;
            o.limit = f.limit;
            o.docs = arr;
            res.json(o);
        })
        .catch(function (err) {
            res.status = err.status || 500;
            //console.log(new Error(err.message));
            res.json(err.status, err);
        });
})
*/
router.get('/transactions.csv', function (req, res) {
    if (req.user.access_level == 'partner') {
        res.sendStatus(403);
    }
    var str = Transaction.find().sort({time: -1}).batchSize(1000000000).cursor();
    res.writeHead(200, {
        'Content-Type': 'text/csv',
        'Access-Control-Allow-Origin': '*',
        'Content-Disposition': 'attachment; filename=transactions.csv'
    });
    var st = "Time,Account,Type,Amount,Currency,Description,Source\n";
    res.write(st);
    str.on("data", function (d) {
        var str = d.time + ',' + req.user.rwnames[d.account] + ',' + d.type + ',' + d.amount + ',' + d.currency + ',' + d.description + ',' + d.source + '\n';
        res.write(str);
    })
    str.on("end", function () {
        res.end();
    })
})
router.get('/topuplog/item/:id', function (req, res) {
    Topuplog.findOne({_id: req.params.id})
        .then(function (t) {
            res.json(t);
        })
})
router.get('/topuplog/item/:id/refund', async function (req,res) {
var tlog = await Topuplog.findOne({_id : req.params.id}).exec();
try {
    var r1 = await Finance.refund(tlog._id);
    console.log('R1', r1);
} catch (e) {
    console.log('Error', e);
    var r1 = false;
}
if (r1 !== false) {
    tlog.success = false;
    tlog.message = 'Recharge Failed (refunded)';
    tlog.code = "RECHARGE_FAILED";
    tlog.state = "fin";
    await tlog.save();
    res.status(200).send(tlog);
} else {
    res.sendStatus(404);
}


})
router.get('/topuplog/topuplog', function (req, res) {
    if (req.user.access_level == 'partner') {
        res.sendStatus(403);
    }
    req.body = JSON.parse(new Buffer(req.query.filter, 'base64').toString('ascii'));
    list1 = [];
    var listW = [];
    var alist = [];
    co(function*() {
        var Li1 = yield Account.find({type: 'agent'}).exec();
        for (var i = 0; i < Li1.length; i++) {
            var r = Li1[i];
            alist[r._id] = r.account_name;
            var par = yield Account.findOne({_id: r.parent}).exec();
            if (par !== null) {
                if (par.type == 'wholesaler') {
                    if (par !== null) {
                        listW[r._id] = par.account_name;
                    }
                    
                } else {
                    var p2 = yield Account.findOne({_id : par.parent}).exec();
                    if (p2 !== null) {
                        listW[r._id] = p2.account_name;
                    }
                   
                }
                list1[r._id] = par.account_name;
            }
          
            
          
        }
    })
        .then(function (xaa) {

            if (req.body.account == "all") {
                var ob = {}
            } else {
                var ob = {account: req.body.account}
            }
            if (req.body.wholesaler !== '') {
                ob.wholesaler = req.body.wholesaler;
            }
            if ((req.body.date_from !== '')) {
                if ('undefined' !== typeof req.body.timezone) {
                    if (req.body.timezone !== '') {
                        var off = offset[req.body.timezone];
                        res.locals.offset = off;
                        //console.log('OFF', off)

                        if (off < 0) {
                            //var offs = off.replace('-', '')
                            var h = (parseInt(off / 60)) * 1;
                            var m = (off % 60) * 1;
                            var compTZ = String("-" + pad(h) + ":" + pad(m));
                        } else {
                            var h = parseInt(off / 60);
                            var m = off % 60;
                            var compTZ = String("+" + pad(h) + ":" + pad(m));
                        }

                    } else {
                        res.locals.offset = 0;
                        var compTZ = "Z"
                    }
                } else {
                    res.locals.offset = 0;
                    var compTZ = "Z"
                }

                if (req.body.time_from == '') {
                    req.body.time_from = "2017-01-01T00:00:00.000Z"
                }
                if (req.body.time_to == '') {
                    req.body.time_to = "2017-01-01T23:59:59.999Z"
                }
                if (req.body.date_to == '') {
                    req.body.date_to = new Date().toISOString();
                }
                var dfr = req.body.date_from.split("T")[0];
                var tfr = req.body.time_from.split("T")[1].split("Z")[0]
                var dto = req.body.date_to.split("T")[0];
                var tto = req.body.time_to.split("T")[1].split("Z")[0];
                //console.log('TFR', dfr + 'T' + tfr + compTZ)
                var time_from = new Date(dfr + 'T' + tfr + compTZ);
                var time_to = new Date(dto + 'T' + tto + compTZ);
                ob.time = {$lte: time_to, $gte: time_from}
            }


            if (req.body.target !== '') {
                ob.target = req.body.target
            }
            if ('undefined' !== req.body.success) {
                if (req.body.success !== '') {
                    if (req.body.success == 'true') {
                        ob.success = true;
                    } else {
                        ob.success = false;
                    }
                }
            }
            if ('' !== req.body.customer_reference) {
                ob.customer_reference = req.body.customer_reference;
            }
            if ('' !== req.body.operator_reference) {
                ob.operator_reference = req.body.operator_reference;
            }

            if (req.body.code !== '') {
                ob.code = req.body.code;
            }
            if (req.body.channel !== '') {
                ob.channel = req.body.channel;
            }
            if (req.body.type !== '') {
                ob.type = req.body.type;
            }
            if (req.body.vnd_sim !== '') {
                ob.vnd_sim = req.body.vnd_sim;
            }
            if (req.body.country !== '') {
                ob.country = req.body.country;
            }
		if (req.body.tag !== '') {
                ob.tag = req.body.tag;
            }
            if (req.body.operator_name !== '') {
                ob.operator_name = req.body.operator_name;
            }
            var str = Topuplog.find(ob).sort({time: -1}).batchSize(1000000).cursor();
            if(req.query.category == 'csv')
            {
                res.writeHead(200, {
                    'Content-Type': 'text/csv',
                    'Access-Control-Allow-Origin': '*',
                    'Content-Disposition': 'attachment; filename=topuplog.csv'
                });
                var st = "Time,Account Name,Parent,Wholesaler,Type,Product ID,Successful,Target,Topup Amount,Topup Currency, Paid Amount, Paid Currency, System Reference, Customer Reference, Operator Reference, App Host, Vendor SIM, Tag, Country, Operator Name, Response Code, Response Message,Completed In, Channel, IP\n";
                res.write(st);
                str.on("data", function (d) {
                    try {
                        var acn = alist[d.account];
                    } catch (e) {
                        console.log('Error', e, d.account);
                        var acn = '';
                    }
                    var mtime = new DateWithOffset(d.time, res.locals.offset || 0).toString()
                    var str = mtime + ',' + acn + ',' + list1[d.account] + ','  + listW[d.account] + ',' + d.type + ',' + d.product_id + ',' + d.success + ',' + d.target + ',' + d.topup_amount + ',' + d.topup_currency + ',' + d.paid_amount + ',' + d.paid_currency + ',' + d.operator_reference + ',' + d.customer_reference + ',' + d.api_transactionid + ',' + d.app_host + ',' + d.vnd_sim + ',' + d.tag + ',' + d.country + ',' + d.operator_name + ',' + d.code + ',' + d.message + ',' + d.completed_in + ',' + d.channel + ',' + d.exec_ip + '\n';
                   
                    res.write(str);
                })
                str.on("end", function () {
                    res.end();
                })
            }else if(req.query.category == 'txt')
            {
                res.writeHead(200, {
                    'Content-Type': 'text',
                    'Access-Control-Allow-Origin': '*',
                    'Content-Disposition': 'attachment; filename=topuplog.txt'
                });
                var st = "Time,Account Name,Parent,Wholesaler,Type,Product ID,Successful,Target,Topup Amount,Topup Currency, Paid Amount, Paid Currency, System Reference, Customer Reference, Operator Reference, App Host, Vendor SIM, Tag, Country, Operator Name, Response Code, Response Message,Completed In, Channel, IP\n";
                res.write(st);
                str.on("data", function (d) {
                    try {
                        var acn = alist[d.account];
                    } catch (e) {
                        console.log('Error', e, d.account);
                        var acn = '';
                    }
                    var mtime = new DateWithOffset(d.time, res.locals.offset || 0).toString()
                    var str = mtime + ',' + acn + ',' + list1[d.account] + ',' + listW[d.account] + ',' + d.type + ',' + d.product_id + ',' + d.success + ',' + d.target + ',' + d.topup_amount + ',' + d.topup_currency + ',' + d.paid_amount + ',' + d.paid_currency + ',' + d.operator_reference + ',' + d.customer_reference + ',' + d.api_transactionid + ',' + d.app_host + ',' + d.vnd_sim + ',' + d.tag + ',' + d.country + ',' + d.operator_name + ',' + d.code + ',' + d.message + ',' + d.completed_in + ',' + d.channel + ',' + d.exec_ip + '\n';
                    res.write(str);
                })
                str.on("end", function () {
                    res.end();
                })
            }else if(req.query.category == 'xlsx')
            {
                var styles = {
                    headerDark: {
                      fill: {
                        fgColor: {
                          rgb: 'FF000000'
                        }
                      },
                      font: {
                        color: {
                          rgb: 'FFFFFFFF'
                        },
                        sz: 10,
                        bold: true,
                        underline: true
                      }
                    },
                    cellPink: {
                      fill: {
                        fgColor: {
                          rgb: 'FFFFCCFF'
                        }
                      }
                    },
                    cellGreen: {
                      fill: {
                        fgColor: {
                          rgb: 'FF00FF00'
                        }
                      }
                    },
                    cellTime: {
                        fill: {
                            fgColor: {
                                rgb: 'FF000000'
                              }
                        },
                        font: {
                            color: {
                              rgb: 'FFFFFFFF'
                            },
                            sz: 10,
                            bold: true,
                            underline: true
                          },
                        numFmt :  "dd/mm/yyyy hh:nn:ss"
                    },
                    cellNum: {
                        fill: {
                            fgColor: {
                                rgb: 'FF000000'
                              }
                        },
                        font: {
                            color: {
                              rgb: 'FFFFFFFF'
                            },
                            sz: 10,
                            bold: true,
                            underline: true
                          },
                        numFmt : "0.00%"
                    }
                  };
                var specification = {
                      Time: { // <- the key should match the actual data key
                      displayName: 'Time', // <- Here you specify the column header
                      headerStyle: styles.cellTime,
                      width : 30
                    },
                    Account_Name: {
                      displayName: 'Account Name',
                      headerStyle: styles.headerDark,
                      width: '10' // <- width in chars (when the number is passed as string)
                    },
                    Parent: {
                      displayName: 'Parent',
                      headerStyle: styles.headerDark,
                      width: '10' 
                    },
                    Wholesaler: {
                        displayName : 'Wholesaler',
                        headerStyle: styles.headerDark,
                        width : '10'
                    },
                    Type: {
                      displayName: 'Type',
                      headerStyle: styles.headerDark,
                      width: '5' 
                    },
                    Product_ID: {
                      displayName: 'Product ID',
                      headerStyle: styles.cellNum,
                      width: 10 
                    },
                    Successful: {
                      displayName: 'Successful',
                      headerStyle: styles.headerDark,
                      width: '3' 
                    },
                    Target: {
                      displayName: 'Target',
                      headerStyle: styles.cellNum,
                      width: 12 
                    },
                    Topup_Amount: {
                      displayName: 'Topup Amount',
                      headerStyle: styles.cellNum,
                      width: 10 
                    },
                    Topup_Currency: {
                      displayName: 'Topup Currency',
                      headerStyle: styles.headerDark,
                      width: '3' 
                    },
                    Paid_Amount: {
                      displayName: 'Paid Amount',
                      headerStyle: styles.cellNum,
                      width: 20 
                    },
                    Paid_Currency: {
                      displayName: 'Paid Currency',
                      headerStyle: styles.headerDark,
                      width: '3' 
                    },
                    System_Reference: {
                      displayName: 'System Reference',
                      headerStyle: styles.headerDark,
                      width: '30' 
                    },
                    Customer_Reference: {
                      displayName: 'Customer Reference',
                      headerStyle: styles.headerDark,
                      width: '30' 
                    },
                    Operator_Reference: {
                      displayName: 'Operator Reference',
                      headerStyle: styles.headerDark,
                      width: '30' 
                    },
                    App_Host:{
                        displayName: 'App Host',
                        headerStyle: styles.headerDark,
                        width: '10'
                    },
                    Vendor_SIM:{
                        displayName: 'Vendor SIM',
                        headerStyle: styles.cellNum,
                        width: 10
                    },
			Tag:{
                        displayName: 'Tag',
                        headerStyle: styles.cellNum,
                        width: 10
                    },
                    Country: {
                      displayName: 'Country',
                      headerStyle: styles.headerDark,
                      width: '10' 
                    },
                    Operator_Name: {
                      displayName: 'Operator Name',
                      headerStyle: styles.headerDark,
                      width: '10' 
                    },
                    Response_Code: {
                      displayName: 'Response Code',
                      headerStyle: styles.headerDark,
                      width: '20' 
                    },
                    Response_Message: {
                      displayName: 'Response Message',
                      headerStyle: styles.headerDark,
                      width: '20' 
                    },
                    Completed_In: {
                      displayName: 'Completed In',
                      headerStyle: styles.headerDark,
                      width: '5' 
                    },
                    Channel: {
                      displayName: 'Channel',
                      headerStyle: styles.headerDark,
                      width: '5' 
                    },
                    IP: {
                        displayName: 'IP',
                        headerStyle: styles.headerDark,
                        width: '5' 
                      }
                  }
                  const dataset = [];
                str.on("data", function (d) {
                    try {
                        var acn = alist[d.account];
                    } catch (e) {
                        console.log('Error', e, d.account);
                        var acn = '';
                    }
                    var row = {};
                    row.Time = new Date(d.time.getTime() + 60*res.locals.offset*1000 );
                    row.Account_Name = acn;
                    row.Parent = list1[d.account] ;
                    row.Wholesaler = listW[d.account];
                    row.Type = d.type ;
                    row.Product_ID = d.product_id;
                    row.Successful = d.success ;
                    row.Target = d.target ;
                    row.Topup_Amount = d.topup_amount ;
                    row.Topup_Currency = d.topup_currency ;
                    row.Paid_Amount = d.paid_amount ;
                    row.Paid_Currency = d.paid_currency ;
                    row.System_Reference = d.operator_reference ;
                    row.Customer_Reference = d.customer_reference ;
                    row.Operator_Reference = d.api_transactionid ;
                    row.App_Host = d.app_host;
                    row.Vendor_SIM = d.vnd_sim;
			row.Tag = d.tag;
                    row.Country = d.country ;
                    row.Operator_Name = d.operator_name ;
                    row.Response_Code = d.code ;
                    row.Response_Message = d.message ;
                    row.Completed_In = d.completed_in ;
                    row.Channel = d.channel;
                    row.IP = d.exec_ip;
                    dataset.push(row);
                })
                str.on("end", function () {
                    var report = excel.buildExport(
                        [ // <- Notice that this is an array. Pass multiple sheets to create multi sheet report
                          {
                            name: 'topuplog', // <- Specify sheet name (optional)
                            specification: specification, // <- Report specification
                            data: dataset // <-- Report data
                          }
                        ]
                      );
                    res.attachment('topuplog.xlsx');
                    res.send(report);
                })
            }else{

            }
            
        })

})
/*
 router.get('/topuplog/topuplog.csv', function (req, res) {
 var list1 = [];
 var list2 = [];
 co(function* () {
 var AccList = yield Account.find({type : 'wholesaler'}).exec();
 for (var i = 0; i < AccList.length; i++ ) {

 var r = AccList[i];
 var tO = {
 id : r._id,
 name : r.account_name
 }
 list1.push(tO)
 }
 for(var i = 0; i < list1.length; i++) {

 var Li1 = yield Account.find({parent : list1[i].id}).exec();
 for (var x = 0; x < Li1.length; x++) {
 list2[Li1[x]._id] = list1[i].name;
 if (Li1[x].type == 'reseller') {
 var Li2 = yield Account.find({parent : Li1[x]._id}).exec();
 for (var z = 0; z < Li2.length; z++) {
 list2[Li2[z]._id] = list1[i].name;
 }
 //console.log('LIST2', list2)
 } else {
 //do nothing
 }
 }
 }
 })
 .then(function (xaa) {
 var str = Topuplog.find().sort({time : -1}).batchSize(1000000000).cursor();
 res.writeHead(200, {
 'Content-Type': 'text/csv',
 'Access-Control-Allow-Origin': '*',
 'Content-Disposition': 'attachment; filename=topuplog.csv'
 });
 var st = "Time,Account ID,Parent,Type,Product ID,Successful,Target,Topup Amount,Topup Currency, Paid Amount, Paid Currency, Operator Reference, Country, Operator Name, Response Code, Response Message\n";
 res.write(st);
 str.on("data", function (d) {
 var str = d.time + ',' + req.user.rwnames[d.account] + ',' + list2[d.account] + ',' + d.type + ',' + d.product_id + ',' + d.success + ',' + d.target + ',' + d.topup_amount + ',' + d.topup_currency + ',' + d.paid_amount + ',' + d.paid_currency + ',' + d.operator_reference + ',' + d.country + ',' + d.operator_name + ',' + d.code + ',' + d.message + '\n';
 res.write(str);
 })
 str.on("end", function () {
 res.end();
 })
 })
 .catch(function (err) {
 //console.log('ERROR', err);
 res.sendStatus(500);
 })
 })
 */
router.get('/topuplog/:page', async function (req, res) {
    console.log('USER', req.user)
    var opts = {page: req.params.page, limit: 500, sort: {time: -1}, select : {request_debug : false, response_debug : false, client_apiresponse : false, client_apireqbody : false}};
    if (req.user.access_level == 'partner') {
        var ob = {tag : req.user.partner_tag, wholesaler : {$nin : ["58b05ba21271226a2018059c"]}}
    } else {
        var ob = {};
    }
    try {
        var f = await Topuplog.paginate(ob, opts);
    } catch (e) {
        var f = null;
        console.log('TLOG-ERR', e);
    }
    if (f !== null) {
        var o = {};
        o.count = f.total;
        o.pages = f.pages;
        o.page = f.page;
        o.limit = f.limit;
        o.docs = f.docs;
        res.json(o);
    } else {
        res.sendStatus(434);
    }
    /*
    var list1 = [];
    var list2 = [];
    co(function*() {
        var AccList = yield Account.find({type: 'wholesaler'}).exec();
        
        for (var i = 0; i < AccList.length; i++) {

            var r = AccList[i];
            var tO = {
                id: r._id,
                name: r.account_name
            }
            list1.push(tO)
        }
        for (var i = 0; i < list1.length; i++) {

            var Li1 = yield Account.find({parent: list1[i].id}).exec();
            for (var x = 0; x < Li1.length; x++) {
                list2[Li1[x]._id] = list1[i].name;
                if (Li1[x].type == 'reseller') {
                    var Li2 = yield Account.find({parent: Li1[x]._id}).exec();
                    for (var z = 0; z < Li2.length; z++) {
                        if (Li2 !== null) {
                            list2[Li2[z]._id] = list1[i].name;
                        }
                        
                    }
                } else {
                    //do nothing
                }
            }
        }
    })
        .then(function (xaa) {
            var ob2 = {};
            if (req.query.fields) {
                var li = req.query.fields.split(',');
                li.forEach((l) => {
                    ob2[l] = true;
            })
            }
            var opts = {page: req.params.page, limit: 500, sort: {time: -1}};
            return Topuplog.paginate({}, opts)
        })
        .then(function (f) {
            var docs = [];
            f.docs.forEach(function (fr) {
                var doc = fr.toObject();
                doc.account_name = req.user.rwnames[fr.account];
                doc.parent = list2[fr.account];
                docs.push(doc);
            })
            var o = {};
            o.count = f.total;
            o.pages = f.pages;
            o.page = f.page;
            o.limit = f.limit;
            o.docs = docs;
            res.json(o);
        })
        .catch(function (err) {
            res.status = err.status || 500;
            //console.log(new Error(err.message));
            res.json(err.status, err);
        });
        */
});
router.post('/topuplog/page/:page', function (req, res) {
    list1 = [];
    co(function*() {
       return true;
    })
        .then(async function (xaa) {
            var canUseCustRef = true;
            var opts = {
                page: req.params.page,
                limit: 100,
                sort: {time: -1}
            };
            if ('undefined' !== typeof req.body.account) {
                if (req.body.account == "all") {
                    var ob = {}
                } else {
                    var a1 = await Account.findOne({_id : req.body.account});
                    if (a1.type == 'agent') {
                        var ob = {account: req.body.account}
                        
                    } else if (a1.type == 'reseller') {
                        var alist = await Account.find({parent : req.body.account});
                        var myLi = [];
                        for (var i = 0; i < alist.length; i++) {
                            myLi.push(alist[i]._id);
                        }
                        var ob = {account : {$in: myLi}, wholesaler : a1.parent};
                        canUseCustRef = false;
                    }
                    
                }
            } else {
                var ob = {}
            }

            if ((req.body.date_from !== '')) {
                if ('undefined' !== typeof req.body.timezone) {
                    if (req.body.timezone !== '') {
                        var off = offset[req.body.timezone];
                        res.locals.offset = off;
                        //console.log('OFF', off)

                        if (off < 0) {
                            //var offs = off.replace('-', '')
                            var h = (parseInt(off / 60)) * 1;
                            var m = (off % 60) * 1;
                            var compTZ = String("-" + pad(h) + ":" + pad(m));
                        } else {
                            var h = parseInt(off / 60);
                            var m = off % 60;
                            var compTZ = String("+" + pad(h) + ":" + pad(m));
                        }

                    } else {
                        res.locals.offset = 0;
                        var compTZ = "Z"
                    }
                } else {
                    res.locals.offset = 0;
                    var compTZ = "Z"
                }

                if (req.body.time_from == '') {
                    req.body.time_from = "2017-01-01T00:00:00.000Z"
                }
                if (req.body.time_to == '') {
                    req.body.time_to = "2017-01-01T23:59:59.999Z"
                }
                if (req.body.date_to == '') {
                    req.body.date_to = new Date().toISOString();
                }
                var dfr = req.body.date_from.split("T")[0];
                var tfr = req.body.time_from.split("T")[1].split("Z")[0]
                var dto = req.body.date_to.split("T")[0];
                var tto = req.body.time_to.split("T")[1].split("Z")[0];
                //console.log('TFR', dfr + 'T' + tfr + compTZ)
                //console.log('TTO', dto + 'T' + tto + compTZ)
                var time_from = new Date(dfr + 'T' + tfr + compTZ);
                var time_to = new Date(dto + 'T' + tto + compTZ);
                ob.time = {$lte: time_to, $gte: time_from}
            }

            if (req.body.target !== '') {
                ob.target = req.body.target
            }
            if ('undefined' !== req.body.success) {
                if (req.body.success !== '') {
                    if (req.body.success == 'true') {
                        ob.success = true;
                    } else {
                        ob.success = false;
                    }
                }
            }
            if ('' !== req.body.customer_reference) {
                if ((req.body.account == 'all') || (req.body.account == '')) {
                    console.log('SW1');
                    ob.customer_reference =  req.body.customer_reference;
                } else {
                    if (canUseCustRef) {
                        console.log('SW2');
                        ob.customer_reference = req.body.account + '#' + req.body.customer_reference;
                    } else {
                        ob.customer_reference =  req.body.customer_reference;
                    }
                   
                }
                
            }
            if ('' !== req.body.operator_reference) {
                ob.operator_reference = req.body.operator_reference;
            }
            if ('' !== req.body.api_transactionid) {
                ob.api_transactionid = req.body.api_transactionid;
            }
            if (req.body.code !== '') {
                ob.code = req.body.code;
            }
            if (req.body.channel !== '') {
                ob.channel = req.body.channel;
            }
            if (req.body.type !== '') {
                ob.type = req.body.type;
            }
            if (req.body.country !== '') {
                ob.country = req.body.country;
            }
		    if (req.body.tag !== '') {
                ob.tag = req.body.tag;
            }
            if (req.body.currency !== '') {
                ob.topup_currency = req.body.currency;
            }
            if (req.body.operator_name !== '') {
                ob.operator_name = req.body.operator_name;
            }
            if (req.body.vnd_sim !== '') {
                ob.vnd_sim = req.body.vnd_sim;
            }
            if (req.body.wholesaler !== '') {
                if ('undefined' == typeof ob.wholesaler) {
                    ob.wholesaler = req.body.wholesaler;
                }
               
            }
            res.locals.ob = ob;
            if (req.user.access_level == 'partner') {
                res.locals.ob.tag = req.user.partner_tag;
                res.locals.ob.wholesaler = {$ne : "58b05ba21271226a2018059c"}
            }
            res.locals.opts = opts;
            //console.log(ob) ;
            return false;
        })
        .then(function (f) {
            console.log('Get topup log', res.locals.ob, res.locals.opts)
            return Topuplog.paginate(res.locals.ob, res.locals.opts)
        })
        .then(function (z) {
            ////console.log(z)
            var o = {};
            /*
            var docs = [];

            z.docs.forEach(function (fr) {
                var doc = fr.toObject();
                doc.account_name = req.user.rwnames[fr.account];
                doc.parent = list1[fr.account];
                if ('undefined' !== typeof res.locals.offset) {
                    //        //console.log('OFFSET IS ', res.locals.offset)
                    doc.time = new DateWithOffset(fr.time, res.locals.offset || 0).toString()
                }

                docs.push(doc);
            })
            */
            o.count = z.total;
            o.pages = z.pages;
            o.page = z.page;
            o.limit = z.limit;
            o.docs = z.docs;
            o.filter = new Buffer(JSON.stringify(req.body)).toString('base64');
            //         o.summary = res.locals.sum;
            res.json(o);
        })
        .catch(function (err) {
            res.status = err.status || 500;
            //console.log(new Error(err.message));
            console.log('Error', err);
           // res.json(err.status, err);
           res.status(err.status).send(err);
        });
})
router.get('/users', async function (req, res) {
    var a = await Cache.get('userlist');
    if (a !== false) {
        res.json(a);
    } else {
        User.find()
        .then(async function (u) {
            var o = {}
            o.count = u.length;
            o.users = u;
            await Cache.set('userlist', o, 7200);
            res.json(o);
        })
        .catch(function (err) {
            res.status = err.status || 500;
            //console.log(new Error(err.message));
            res.json(err.status, err);
        });
    }
   
})
router.get('/dashboard', async function (req, res) {
    var a = await Cache.get('dashmain');
    if (a !== false) {
        res.json(a);
    } else {
        Account.find({type: 'reseller'}).count()
        .then(function (rc) {
            res.locals.rc = rc;
            return Account.find({type: 'agent'}).count().exec();
        })
        .then(function (ac) {
            res.locals.ac = ac;
            return Account.find({type: 'wholesaler'}).count().exec();
        })
        .then(function (wc) {
            res.locals.wc = wc;
            return User.find().count().exec();
        })
        .then(function (uc) {
            res.locals.users = uc;
            return Corestat.findOne().sort({time: -1}).exec();
        })
        .then(async function (stats) {
            var d = {};
            d.wholesalers = res.locals.wc;
            d.resellers = res.locals.rc;
            d.agents = res.locals.ac;
            d.users = res.locals.users;
            d.balances = stats.balances;
            d.top5_countries_topup_count = stats.top5_countries_topup_count;
            d.top5_countries_topup_amount = stats.top5_countries_topup_amount;
            d.top5_accounts_topup_count = stats.top5_accounts_topup_count;
            d.top5_accounts_topup_amount = stats.top5_accounts_topup_amount;
            d.top5_operations_bycode = stats.top5_operations_bycode;
            d.total_operations_count = stats.total_operations_count;
            await Cache.set('dashmain', d, 1800);
            res.json(d);
        })
        .catch(function (err) {
            res.status = err.status || 500;
            //console.log(new Error(err.message));
            res.json(err.status, err);
        });
    }
   
})
router.get('/currencies', async function (req, res) {
    var x = await Currency.find().exec();
    res.json(x);
    /*
    var a = Cache.get('curlist');
    if (a !== false) {
        res.json(a);
    } else {
        Currency.find()
        .then(async function (c) {
            await Cache.set('curlist', c, 86400);
            res.json(c);
        })
        .catch(function (err) {
            winston.log('error', err);
            res.status(err.status || 500).send(err);
        });
    }
   */
})
router.get('/countries', async function (req, res) {
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

            //console.log(new Error(err.message));
            res.status(err.status || 500).send(err);
        });
    }
   
})
router.get('/countries/:country', async function (req, res) {
    var a = await Cache.get('plist_' + req.params.country);
    if (a !== false) {
        res.json(a);
    } else {
        ProvHelper.find({iso: req.params.country})
        .then(async function (c) {
            await Cache.set('plist_' + req.params.country, c, 86400);
            res.json(c)
        })
        .catch(function (err) {

            //console.log(new Error(err.message));
            res.status(err.status || 500).send(err);
        });
    }
   
})
router.get('/credentials', function (req, res) {
    Apicred.find({isSystemWide: true})
        .then(function (app) {
            var r = {
                count: app.length,
                credentials: app
            }
            res.json(r)
        })
})
router.get('/credentials/:id', function (req, res) {
    Apicred.findOne({_id: req.params.id, isSystemWide: true})
        .then(function (crd) {
            res.json(crd)
        })
})
router.put('/credentials/:id', function (req, res) {

    Apicred.findOne({_id: req.params.id, isSystemWide: true})
        .then(function (crd) {
            //console.log(crd, req.body);

            var fKeys = ['sourceNumbers', 'isSystemWide', 'srcNum']
            for (var key in req.body) {
                if (fKeys.contains(key)) {
                    continue;
                }
                crd[key] = req.body[key];
            }
            var sa = req.body.srcNum.split(',')
            if (sa.length > 0) {
                crd.sourceNumbers = [];
                crd.sourceNumbers = sa;
            }

            return crd.save();
        })
        .then(function (tx) {
            res.json(tx)
        })

})
router.post('/credentials/', function (req, res) {
    var o = new Apicred(req.body)
    o.isSystemWide = true;
    o.save(function (err, ob) {
        if (err) {
            res.sendStatus(500)
        } else {
            res.status(201).send(ob);
        }
    })
})

router.get('/settings', function (req, res) {
    Setting.find({global: true})
        .then(function (app) {
            var r = {
                count: app.length,
                settings: app
            }
            res.json(r)
        })
})
router.get('/settings/:id', function (req, res) {
    Setting.findOne({_id: req.params.id, global: true})
        .then(function (crd) {
            res.json(crd)
        })
})
router.put('/settings/:id', function (req, res) {

    Setting.findOne({_id: req.params.id, global: true})
        .then(function (crd) {
            //console.log(crd, req.body);

            var fKeys = ['global', 'updatedAt', 'createdAt', '_id', 'key']
            for (var key in req.body) {
                if (fKeys.contains(key)) {
                    continue;
                }
                crd[key] = req.body[key];
            }

            return crd.save();
        })
        .then(function (tx) {
            res.json(tx)
        })

})
router.post('/settings/', function (req, res) {
    var o = new Setting(req.body)
    o.global = true;
    o.save(function (err, ob) {
        if (err) {
            res.sendStatus(500)
        } else {
            res.status(201).send(ob);
        }
    })
})
router.get('/loginlogs/:page', function (req, res) {
    var list1 = [];
    var list2 = [];
    co(function*() {
        var AccList = yield Account.find({type: 'wholesaler'}).exec();
        for (var i = 0; i < AccList.length; i++) {

            var r = AccList[i];
            var tO = {
                id: r._id,
                name: r.account_name
            }
            list1.push(tO)
        }
        for (var i = 0; i < list1.length; i++) {

            var Li1 = yield Account.find({parent: list1[i].id}).exec();
            for (var x = 0; x < Li1.length; x++) {
                list2[Li1[x]._id] = list1[i].name;
                if (Li1[x].type == 'reseller') {
                    var Li2 = yield Account.find({parent: Li1[x]._id}).exec();
                    for (var z = 0; z < Li2.length; z++) {
                        if (Li2 !== null) {
                            list2[Li2[z]._id] = list1[i].name;
                        }
                       
                    }
                    //console.log('LIST2', list2)
                } else {
                    //do nothing
                }
            }
        }
    })
        .then(function (xaa) {
            var opts = {page: req.params.page, limit: 500, sort: {time: -1}, select: {password: false, token: false}};
            return LoginLog.paginate({}, opts)
        })
        .then(function (f) {
            var docs = [];
            f.docs.forEach(function (fr) {
                var doc = fr.toObject();
                doc.account_name = req.user.rwnames[fr.account];
                doc.parent = list2[fr.account];
                docs.push(doc);
            })
            var o = {};
            o.count = f.total;
            o.pages = f.pages;
            o.page = f.page;
            o.limit = f.limit;
            o.docs = docs;
            res.json(o);
        })
        .catch(function (err) {
            res.status = err.status || 500;
            //console.log(new Error(err.message));
            res.json(err.status, err);
        });
});
router.get('/ftreplist', async (req,res) => {
    var TrxList = await Topuplog.find({type : 'ft', success : true, api_transactionid : {'$exists' : false}}).sort({time : -1}).exec();
    res.json({count : TrxList.length, transactions : TrxList});
})
router.get('/ftview/:ref', async (req,res) => {
    var Trx = await Topuplog.findOne({operator_reference : req.params.ref}).exec();
    res.json(Trx);
})
router.get('/ftreplay/:ref', async (req,res) => {
var Trx = await Topuplog.findOne({operator_reference : req.params.ref}).exec();
if (Trx !== null) {
    if ('undefined' == typeof Trx.api_transactionid) {
        var creds = await Apicred.findOne({apicode : 'NGTP'}).exec();
        var tsp = Trx.target.split('/');
        var o1 = {
          target_accountNumber : tsp[1],
          destination_code : tsp[0]
         }
         var res1 = await s.doNGTPNameCheck(creds, o1);
         console.log('RES', res);
        var o2 = {
            reference : res1.session_id,
            bvn : res1.bvn,
            kyc_level : res1.kyc_level,
            target_accountName : res1.account_name,
            target_accountNumber : res1.account_number,
            destination_code : o1.destination_code,
            amount : Trx.topup_amount,
            narration : 'Payment'
        }
        var res2 = await s.doNGTPPayment(creds, o2);
        if (res2.success == true) {
            //All Goodd
            Trx.api_transactionid = res2.reference;
            await Trx.save();
            res.status(200).send({success : true});
        } else {
            res.status(434).send({success : false});
        }
    } else {
        res.sendStatus(403);
    }
} else {
    res.sendStatus(404);
}
//get creds
})
router.get('/rtstats', async (req,res) => {
    var RT = await RTStats.find({}).exec();
    res.json(RT);
})
router.get('/dailysummary', async (req,res) => {
var dsl = await DailySummary.find({}, {accountTopups : false, sales : false, stockLevels : false}).sort({time : -1}).exec();
res.json(dsl);
})
router.get('/dailysummary/last', async (req,res) => {
    var dsl = await DailySummary.findOne({}, {accountTopups : false, sales : false, stockLevels : false}).sort({time : -1}).exec();
    res.json(dsl);
    })
router.get('/dailysummary/:id', async (req,res) => {
    var dsl = await DailySummary.findOne({_id : req.params.id});
    res.json(dsl);
})
router.get('/apisettings', function (req, res) {
    ApiSetting.find({})
        .then(function (app) {
            var r = {
                count: app.length,
                apisettings: app
            }
            res.json(r)
        })
})
router.get('/apisettings/:id', function (req, res) {
    ApiSetting.findOne({_id: req.params.id})
        .then(function (apisetting) {
            res.json(apisetting)
        })
})
router.put('/apisettings/:id', function (req, res) {
    ApiSetting.findOne({_id: req.params.id})
        .then(function (aps) {
            //console.log(aps, req.body);
            var fKeys = []
            for (var key in req.body) {
                if (fKeys.contains(key)) {
                    continue;
                }
                aps[key] = req.body[key];
            }
            return aps.save();
        })
        .then(function (tx) {
            res.json(tx)
        })
})
router.post('/apisettings/', function (req, res) {
    var o = new ApiSetting(req.body)
    o.save(function (err, ob) {
        if (err) {
            res.sendStatus(500)
        } else {
            res.status(201).send(ob);
        }
    })
})
module.exports = router;
