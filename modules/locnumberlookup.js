var app = {};
var co = require('co');
var Gloprefix = require('../models/gloprefix')
var Provmapping = require('../models/provmapping')
var Operator = require('../models/operator')
var Prefix = require('../models/prefix')
var Account = require('../models/account')
var ProfitMap = require('../models/profitmap')
var s = require('./soapclient')

app.lookup = function (msisdn) {
    var number = msisdn.replace(/^0+/, '');
    return new Promise(function (resolve, reject) {
        co(function* () {
              for (i=2; i < (number.length - 2); i++) {
    var ln = number.length;
    var search = number.slice(0, ln - i);
    var r = yield Gloprefix.findOne()
    .where('prefix')
    .regex(new RegExp("^"+search+"$"))
    .exec();
    if (r == null) {
      continue;
    } else {
      break;
    }
    
  }
  if (r !== null) {
      resolve(r);
  } else {
      //do TRTO lookup
      var trto = yield s.getMSISDNInfo(number, 'TRTO');
      if (trto.operatorid !== '') {
          //we have operator id;
          var pmap = yield Provmapping.findOne({trt_id : trto.operatorid}).exec();
          if (pmap !== null) {
              resolve(pmap);
          } else {
              //we don't have it just parse response;
              var robj = {
                  operator_name : trto.operator,
                  country : trto.country,
                  trt_id : trto.operatorid,
                  trl_id : null
              }
              resolve(robj);
          }
      } else {
          var err = {};
          err.status = 404;
          err.code = "MSISDN_NOT_FOUND";
          err.message = "Sorry, we could not find this MSISDN!";
          reject(err);
      }
  }

        }).catch(function (err) {
                var err = {};
          err.status = 404;
          err.code = "MSISDN_NOT_FOUND";
          err.message = "Sorry, we could not find this MSISDN!";
          return reject(err);
        })
    })
}

app.getProfits = function (ac, country, operator) {
    if ('undefined' == typeof country) {
        country = 'ALL'
    }
    if ('undefined' == typeof operator) {
        operator = 'ALL'
    }
    if (country == null) {
        country = 'ALL'
    }
    if (operator == null) {
        operator = 'ALL'
    }
    var resp = {};
    var temp = {};
    return new Promise(function (resolve, reject) {
        co(function* () {
            var myacc = yield Account.findOne({_id : ac}).exec()
            if (myacc !== null) {
                if (myacc.profit_map) {
                    if (myacc.type == 'agent') {
                        //we have minimum of 1 level up 
                        var mypmap = yield ProfitMap.findOne({_id : myacc.profit_map}).exec();
                        if (mypmap !== null) {
                            var gotSpecific = false;
                            var gotCountry = false;
                            var gotAll = false;
                            mypmap.maps.forEach(function (e) {
                                if (e.code == country.toUpperCase() + ':' + operator.toUpperCase()) {
                                    gotSpecific = true;
                                    temp.mySpecific = e.profit_pct;
                                }
                                if (e.code == country.toUpperCase() + ':ALL') {
                                    gotCountry = true;
                                    temp.myCountry = e.profit_pct;
                                }
                                if (e.code == 'ALL:ALL') {
                                    gotAll = true;
                                    temp.myAll = e.profit_pct;
                                }
                            })
                            if (gotSpecific) {
                                resp.agentProfit = temp.mySpecific;
                            } else if (gotCountry) {
                                resp.agentProfit = temp.myCountry;
                            } else if (gotAll) {
                                resp.agentProfit = temp.myAll;
                            } else {
                                resp.agentProfit = 0;
                            }

                        } else {
                            //null
                            var err = {}
                            err.code = "NULL_PROFITMAP";
                            err.message = "Somethings wrong with profitmap for this account, please contact support"
                            err.status = 500;
                            reject(err)
                        }
                        //get parent 
                        if (myacc.parent !== null) {
                            var myParent = yield Account.findOne({_id : myacc.parent}).exec()
                            if (myParent !== null) {
                                //ok 
                                if (myParent.type == 'reseller') {
                                    var respmap = yield ProfitMap.findOne({_id : myParent.profit_map}).exec();
                                    if (respmap !== null) {
                                         var gotSpecific = false;
                            var gotCountry = false;
                            var gotAll = false;
                            respmap.maps.forEach(function (e) {
                                if (e.code == country.toUpperCase() + ':' + operator.toUpperCase()) {
                                    gotSpecific = true;
                                    temp.resSpecific = e.profit_pct;
                                }
                                if (e.code == country.toUpperCase() + ':ALL') {
                                    gotCountry = true;
                                    temp.resCountry = e.profit_pct;
                                }
                                if (e.code == 'ALL:ALL') {
                                    gotAll = true;
                                    temp.resAll = e.profit_pct;
                                }
                            })
                            if (gotSpecific) {
                                resp.resProfit = temp.resSpecific;
                            } else if (gotCountry) {
                                resp.resProfit = temp.resCountry;
                            } else if (gotAll) {
                                resp.resProfit = temp.resAll;
                            } else {
                                resp.resProfit = 0;
                            }
                            if (myParent.parent !== null ) {
                                var myGrandad = yield Account.findOne({_id : myParent.parent}).exec()
                                if (myGrandad !== null) {
                                    if (myGrandad.type !== 'wholesaler') {
                                         var err = {};
                            err.code = "ACCOUNT_CORRUPTED"
                            err.mesage = "Account is corrupted, (WRONG PARENT TYPE) please contact support"
                            err.status = 500;
                            reject(err)
                                    } else {
                                        var wpmap = yield ProfitMap.findOne({_id : myGrandad.profit_map}).exec()
                                        if (wpmap !== null) {
                                              var gotSpecific = false;
                            var gotCountry = false;
                            var gotAll = false;
                            wpmap.maps.forEach(function (e) {
                                if (e.code == country.toUpperCase() + ':' + operator.toUpperCase()) {
                                    gotSpecific = true;
                                    temp.wSpecific = e.profit_pct;
                                }
                                if (e.code == country.toUpperCase() + ':ALL') {
                                    gotCountry = true;
                                    temp.wCountry = e.profit_pct;
                                }
                                if (e.code == 'ALL:ALL') {
                                    gotAll = true;
                                    temp.wAll = e.profit_pct;
                                }
                            })
                            if (gotSpecific) {
                                resp.wProfit = temp.wSpecific;
                            } else if (gotCountry) {
                                resp.wProfit = temp.wCountry;
                            } else if (gotAll) {
                                resp.wProfit = temp.wAll;
                            } else {
                                resp.wProfit = 0;
                            }
                                        resolve(resp);
                                        } else {
                                             var err = {};
                            err.code = "ACCOUNT_CORRUPTED"
                            err.mesage = "Account is corrupted,1 please contact support"
                            err.status = 500;
                            reject(err)
                                        }
                                    }
                                } else {
                                     var err = {};
                            err.code = "ACCOUNT_CORRUPTED"
                            err.mesage = "Account is corrupted,2 please contact support"
                            err.status = 500;
                            reject(err)
                                }
                            } else {
                                 var err = {};
                            err.code = "ACCOUNT_CORRUPTED"
                            err.mesage = "Account is corrupted,3 please contact support"
                            err.status = 500;
                            reject(err)
                            }
                                    } else {
                                         var err = {};
                            err.code = "ACCOUNT_CORRUPTED"
                            err.mesage = "Account is corrupted,4 please contact support"
                            err.status = 500;
                            reject(err)
                                    }
                                } else if (myParent.type == 'wholesaler') {
                                    //last level is where
                                    var wpmap = yield ProfitMap.findOne({_id : myParent.profit_map}).exec()
                                     var gotSpecific = false;
                            var gotCountry = false;
                            var gotAll = false;
                            wpmap.maps.forEach(function (e) {
                                if (e.code == country.toUpperCase() + ':' + operator.toUpperCase()) {
                                    gotSpecific = true;
                                    temp.wSpecific = e.profit_pct;
                                }
                                if (e.code == country.toUpperCase() + ':ALL') {
                                    gotCountry = true;
                                    temp.wCountry = e.profit_pct;
                                }
                                if (e.code == 'ALL:ALL') {
                                    gotAll = true;
                                    temp.wAll = e.profit_pct;
                                }
                            })
                            if (gotSpecific) {
                                resp.wProfit = temp.wSpecific;
                            } else if (gotCountry) {
                                resp.wProfit = temp.wCountry;
                            } else if (gotAll) {
                                resp.wProfit = temp.wAll;
                            } else {
                                resp.wProfit = 0;
                            }
                            resp.resProfit = 0;
                                        resolve(resp);
                                } else {
                                     var err = {};
                            err.code = "ACCOUNT_CORRUPTED"
                            err.mesage = "Account is corrupted,5 please contact support"
                            err.status = 500;
                            reject(err)
                                }
                            } else {
                                 var err = {};
                            err.code = "ACCOUNT_CORRUPTED"
                            err.mesage = "Account is corrupted,6 please contact support"
                            err.status = 500;
                            reject(err)
                            }
                        } else {
                            var err = {};
                            err.code = "ACCOUNT_CORRUPTED"
                            err.mesage = "Account is corrupted,7 please contact support"
                            err.status = 500;
                            reject(err)
                        }
                    } else if (myacc.type == 'reseller') {
                         var mypmap = yield ProfitMap.findOne({_id : myacc.profit_map}).exec();
                        if (mypmap !== null) {
                            var gotSpecific = false;
                            var gotCountry = false;
                            var gotAll = false;
                            mypmap.maps.forEach(function (e) {
                                if (e.code == country.toUpperCase() + ':' + operator.toUpperCase()) {
                                    gotSpecific = true;
                                    temp.mySpecific = e.profit_pct;
                                }
                                if (e.code == country.toUpperCase() + ':ALL') {
                                    gotCountry = true;
                                    temp.myCountry = e.profit_pct;
                                }
                                if (e.code == 'ALL:ALL') {
                                    gotAll = true;
                                    temp.myAll = e.profit_pct;
                                }
                            })
                            if (gotSpecific) {
                                resp.resProfit = temp.mySpecific;
                            } else if (gotCountry) {
                                resp.resProfit = temp.myCountry;
                            } else if (gotAll) {
                                resp.resProfit = temp.myAll;
                            } else {
                                resp.resProfit = 0;
                            }
                            resp.agentProfit = 0;
                            if (myacc.parent !== null) {
                                var myParent = yield Account.findOne({_id : myacc.parent}).exec();
                                if (myParent !== null) {
                                    if (myParent.type !== 'wholesaler') {
                                        var err = {};
                            err.code = "ACCOUNT_CORRUPTED"
                            err.mesage = "Account is corrupted,8 please contact support"
                            err.status = 500;
                            reject(err)
                                    } else {
                                        var wpmap = yield ProfitMap.findOne({_id : myParent.profit_map}).exec()
                                     var gotSpecific = false;
                            var gotCountry = false;
                            var gotAll = false;
                            wpmap.maps.forEach(function (e) {
                                if (e.code == country.toUpperCase() + ':' + operator.toUpperCase()) {
                                    gotSpecific = true;
                                    temp.wSpecific = e.profit_pct;
                                }
                                if (e.code == country.toUpperCase() + ':ALL') {
                                    gotCountry = true;
                                    temp.wCountry = e.profit_pct;
                                }
                                if (e.code == 'ALL:ALL') {
                                    gotAll = true;
                                    temp.wAll = e.profit_pct;
                                }
                            })
                            if (gotSpecific) {
                                resp.wProfit = temp.wSpecific;
                            } else if (gotCountry) {
                                resp.wProfit = temp.wCountry;
                            } else if (gotAll) {
                                resp.wProfit = temp.wAll;
                            } else {
                                resp.wProfit = 0;
                            }
                            resp.agentProfit = 0;
                            resolve(resp);
                                    }
                                } else {
                                    var err = {};
                            err.code = "ACCOUNT_CORRUPTED"
                            err.mesage = "Account is corrupted, 9please contact support"
                            err.status = 500;
                            reject(err)
                                }
                            } else {
                                var err = {};
                            err.code = "ACCOUNT_CORRUPTED"
                            err.mesage = "Account is corrupted, 10please contact support"
                            err.status = 500;
                            reject(err)
                            }
                        } else {
                            //null
                            var err = {}
                            err.code = "NULL_PROFITMAP";
                            err.message = "Somethings wrong with profitmap for this account, please contact support"
                            err.status = 500;
                            reject(err)
                        }
                    } else if (myacc.type == 'wholesaler') {
                        var mypmap = yield ProfitMap.findOne({_id : myacc.profit_map}).exec();
                        if (mypmap !== null) {
                            var gotSpecific = false;
                            var gotCountry = false;
                            var gotAll = false;
                            mypmap.maps.forEach(function (e) {
                                if (e.code == country.toUpperCase() + ':' + operator.toUpperCase()) {
                                    gotSpecific = true;
                                    temp.mySpecific = e.profit_pct;
                                }
                                if (e.code == country.toUpperCase() + ':ALL') {
                                    gotCountry = true;
                                    temp.myCountry = e.profit_pct;
                                }
                                if (e.code == 'ALL:ALL') {
                                    gotAll = true;
                                    temp.myAll = e.profit_pct;
                                }
                            })
                            if (gotSpecific) {
                                resp.wProfit = temp.mySpecific;
                            } else if (gotCountry) {
                                resp.wProfit = temp.myCountry;
                            } else if (gotAll) {
                                resp.wProfit = temp.myAll;
                            } else {
                                resp.wProfit = 0;
                            }
                            resp.agentProfit = 0;
                            resp.resProfit = 0;
                            resolve(resp);
                        } else {
                             var err = {};
                            err.code = "ACCOUNT_CORRUPTED"
                            err.mesage = "Account is corrupted, 11please contact support"
                            err.status = 500;
                            reject(err)
                        }
                    } else {
                        var err = {};
                        err.code = "UNSUPPORTED_ACCOUNT_TYPE"
                        err.message = "Unsupported account type"
                        err.status = 500
                        reject(err)
                    }
                } else {
                    var err = {};
                    err.code = "PROFIT_MAP_NOT_DEFINED";
                    err.message = "Profit map is not defined";
                    err.status = 500;
                    reject(err);
                }
            } else {
                var err = {}
                err.code = "ACCOUNT_NOT_FOUND";
                err.mesage = "Sorry, account is not found";
                err.status = 404;
                reject(err)
            }
        })
        .catch (function (err) {
            return reject(err);
        })
    })
}
module.exports = app;