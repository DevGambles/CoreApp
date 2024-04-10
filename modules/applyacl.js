/* 
* Authorize middleware
* Author : Konstantins Kolcovs
* (c) 2016, OK Media Group LTD.
* File : authorize.js
*/ 

var User = require('../models/user');
var Account = require('../models/account');
var Acl = require('../models/acl')
var oid = require('mongoose').Types.ObjectId;

module.exports = function (req, res, next) {
    req.acl = {}
    req.acl.allow = []
    req.acl.block = []
    req.acl.type = null;
    var temp = {}
   if (typeof req.user !== 'undefined') {
       if (req.user.account_type == 'agent') {
        var exp = new Date(req.user.exp);
        console.log('REQ USER MAINACC', req.user.main_account)
         Account.findOne({_id : req.user.main_account})
            .then(function (acc) {
                temp.l1type = acc.type;
                if ('undefined' !== typeof acc.acl) {
                    temp.l1acl = true;
                    temp.l1parent = acc.parent;
                    return Acl.findOne({_id : acc.acl}).exec();
                } else {
                    temp.l1acl = false;
                    
                    return Account.findOne({_id : acc.parent}).exec()
                }
            })
            .then(function (l1) {
                console.log('L1', l1);
                console.log('TEMP ON L1', temp)
                if (temp.l1acl) {
                    console.log('L1ACL TRUE');
                    req.acl.type = l1.type;
                    //we have agents acl
                    l1.allow.forEach(function (e) {
                        req.acl.allow.push(e.code)
                    })
                    l1.block.forEach(function (e) {
                        req.acl.block.push(e.code)
                    })
                    if (temp.l1parent !== null) {
                        return Account.findOne({_id : temp.l1parent}).exec();
                    } else {
                        //no parent weird but okay....
                        console.log('Doing next on L2 after forEach ELSE')
                        next()
                    }
                } else {
                    console.log('L1ACL FALSE')
                    //no acl on L1 maybe here ?
                    if ('undefined' !== typeof l1.acl) {
                        temp.l2acl = true;
                        temp.l2parent = l1.parent;
                        temp.l2type = l1.type;
                        return Acl.findOne({_id : l1.acl}).exec()
                    } else {
                        //no acl on l2
                        temp.l2acl = false;
                        temp.l2parent = l1.parent;
                        temp.l2type = l1.type;
                        if (l1.type !== 'wholesaler') {
                            if (l1.parent !== null) {
                            return Account.findOne({_id : l1.parent}).exec()
                        } else {
                            //parent of l2 is null
                            console.log('Doing next on L2 ELSE')
                            next();
                        }
                        } else {
                            next();
                        }
                    }
                }
            })
            .then(function (l15) {
                if (temp.l1acl) {
                    if (l15.acl) {
                        temp.l2acl = true;
                        temp.l2type = l15.type;
                        temp.l2parent = l15.parent;
                        return Acl.findOne({_id : l15.acl}).exec();
                    } else {
                        temp.l2acl = false;
                        return l15;
                    }
                } else {
                    return l15;
                }
            })
           .then(function (l2) {
               console.log('L2', l2);
               console.log('TEMP AT L2', temp)
               //here we look at the parent
               if (temp.l2acl) {
                   console.log('L2ACL TRUE')
                   //we have L2 acl
                   console.log('Our L2 type is ', temp.l2type);
                   var t = {};
                   t.allow = []
                   t.block = []
                   t.type = l2.type;
                   l2.allow.forEach(function (e) {
                       t.allow.push(e.code);
                   })
                   l2.block.forEach(function (e) {
                       t.block.push(e.code);
                   })
                   /* first logic */
                   req.acl.allow.map(function (e, i)  {
                       if (t.type == 'permissive') {
                           var ea = e.split(':');

                           if ( (t.block.contains(e.code)) || (t.block.contains(ea[0] + ':ALL')) ) {
                               delete req.acl.allow[i];

                           }
                       } else if (t.type == 'restrictive') {
                           if (! (t.allow.contains(e.code)) && !(t.allow.contains(ea[0] + ':ALL')) ) {
                               delete req.acl.allow[i];
                           }
                       }
                   })
                  t.block.forEach(function (e) {
                      if (req.acl.block.contains(e)) {

                      } else {
                          req.acl.block.push(e)
                      }
                  })

                   /* first logic */
                   if (temp.l2type == 'wholesaler') {
                       next();
                   } else if (temp.l2type == 'reseller') {
                       return Account.findOne({_id : temp.l2parent}).exec();
                   }
               } else {
                   //no acl on L2
                   console.log('L2ACL FALSE, TEMP IS', temp)
                   if (l2.type == 'wholesaler') {
                       next();
                   } else if (l2.type == 'reseller') {

                       return Account.findOne({_id : l2.parent}).exec();
                   }
               }
           })
           .then(function (l3) {
               if ('undefined' !== typeof l3) {
                    console.log('L3', l3);
               //we're at last level
               if ('undefined' !== typeof l3.acl) {
                   temp.l3acl = true;
                   temp.l3type = l3.type;
                   return Acl.findOne({_id : l3.acl}).exec();
               } else {
                   if (l3.type !== 'wholesaler') {
                       temp.l3acl = false;
                       temp.l3type = l3.type;
                       console.log('L3 something messed up, type is ', l3.type);
                       return Account.findOne({_id : l3.parent}).exec()
                   } else {
                       next();
                   }
               }
               }
               
           })
           .then(function (fin) {
               if ('undefined' !== typeof fin) {
                         console.log('FIN', fin);
               if (temp.l3acl) {
                    var t = {};
                   t.allow = []
                   t.block = []
                   t.type = fin.type;
                   fin.allow.forEach(function (e) {
                       t.allow.push(e.code);
                   })
                   fin.block.forEach(function (e) {
                       t.block.push(e.code);
                   })
                   /* first logic */
                   req.acl.allow.map(function (e, i)  {
                       if (t.type == 'permissive') {
                           var ea = e.split(':');

                           if ( (t.block.contains(e.code)) || (t.block.contains(ea[0] + ':ALL')) ) {
                               delete req.acl.allow[i];

                           }
                       } else if (t.type == 'restrictive') {
                           if (! (t.allow.contains(e.code)) && !(t.allow.contains(ea[0] + ':ALL')) ) {
                               delete req.acl.allow[i];
                           }
                       }
                   })
                  t.block.forEach(function (e) {
                      if (req.acl.block.contains(e)) {

                      } else {
                          req.acl.block.push(e)
                      }
                  })
                  next();
               } else {
                   if (temp.l3type == 'wholesaler') {
                       console.log('FIN okay clean exit');
                       next();
                   } else {
                       console.log('L3 weird type should not happen, but the type is ', temp.l3type);
                       next();
                   }
               }
               }
          
           })
            .catch(function (err) {
                console.error(err);
            })
    
       } else {
           //no point in doing that because it's not an agent
           next();
       }
   } else {
       next();
   }
    

};