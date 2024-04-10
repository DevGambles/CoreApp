/* 
* Authorize middleware
* Author : Konstantins Kolcovs
* (c) 2016, OK Media Group LTD.
* File : authorize.js
*/ 

var User = require('../models/admin');
var Accounts = require('../models/account');
var oid = require('mongoose').Types.ObjectId;

module.exports = function (req, res, next) {
    console.log('AUTH-START', new Date())
    if ('undefined' !== typeof req.user) {
         User.findOne({_id : new oid(req.user.iss)}, {password : false}).exec()
         .then(function (user) {
             //Creating initial req.user object with necessary params
             req.user.username = user.username;
             req.user._id = user._id;
             req.user.first_name = user.first_name;
             req.user.last_name = user.last_name;
             req.user.email = user.email;
             if (typeof user.avatar !== 'undefined') {
                 req.user.avatar = user.avatar;
             }
             req.user.access_level = user.access_level;
             if (user.access_level == 'partner') {
                 req.user.partner_tag = user.partner_tag;
             }
             req.user.main_account = user.main_account;
            // return Accounts.find({rwaccess : req.user._id}).exec();
            console.log('AUTH-END', new Date())
            next();
         })
       
         
         .catch(function (error) {
             console.log(error);
             throw error;
         });
    } else {
        console.log('AUTH-END', new Date())
        next();
    }
};