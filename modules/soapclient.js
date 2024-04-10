var app = {};
var https = require('request');
var md5 = require('md5')
var sha1 = require('sha1');
var pp = require('properties-parser');
var xml2js = require('xml2js')
var util = require('util')
var co = require('co');
var Apicred = require('../models/apicred')
var Setting = require('../models/setting')
var UKBLPrice = require('../models/ukblprice')

var SHA512 = require('crypto-js/sha512');
var os = require("os");
var hostname = os.hostname();
var reqn = require('request-promise-native')

const uuid = require('uuid');
const sleep = require('system-sleep');
function randomIntFromInterval(min,max) {
    return Math.floor(Math.random()*(max-min+1)+min);
}
Array.prototype.getIndex = function ( needle ) {
   for (i in this) {
      if (this[i] == needle) return i;
   }
   return false;
}
Array.prototype.contains = function ( needle ) {
    for (i in this) {
       if (this[i] == needle) return true;
    }
    return false;
 }

 const xmparse = d => {
     return new Promise((resolve,reject) => {
         var parser = new xml2js.Parser();
         parser.parseString(d, function (err,body) {
             if (err) {
                 reject(err);
             } else {
                 resolve(body);
             }
         })
     })
 }
 /* NGTP - Nigeria TeasyPay */
 
 app.doNGTPNameCheck = async function (creds, obj) {
     return new Promise(async function (resolve,reject) {
         var msg = '<ValidationRequest>' +
                '<DestinationCode>' + obj.destination_code + '</DestinationCode>' +
                '<AccountNumber>' + obj.target_accountNumber + '</AccountNumber>' +
                '</ValidationRequest>'
       // var en1 = TripleDES.encrypt(msg, creds.password);
        //console.log('EN1', en1.toString())
        console.log('MSG', msg);
        //var encr = en1.toString();
        var eo = {
            method : 'POST',
            uri : 'http://10.127.8.8/ed.php',
            timeout : 5000,
            form : {
                op : 'e',
                data : msg,
                key : creds.password
            }
        }
        var encr = await reqn(eo);

        //var encr = encrypt(msg, creds.password);
        var hval = encr + creds.pin;
        console.log('hval', hval);
        var hash = SHA512(hval);
        var tpl = '<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:teas="http://teasy.com">' +
        '<soap:Header/>' +
        '<soap:Body>' +
        '<teas:ne>' +
        '<teas:apiUser>' + creds.username + '</teas:apiUser>' +
        '<teas:request>' + encr + '</teas:request>' +
         '<teas:hash>' + String(hash).toUpperCase() + '</teas:hash>' +
        '</teas:ne>' +
        '</soap:Body>' +
        '</soap:Envelope>' 
        console.log('TP', tpl);
        console.log('ENCR', encr);
       // console.log('DECR', decr(encr, creds.password));
       // resolve(tpl);
       var b1 = {
        method : 'POST',
        uri : creds.link,
        timeout : 300000,
        body : tpl
    }
    try {
        var s1 = await reqn(b1);
    } catch (e) {
        console.log('Error', e);
        var s1 = false;
    }
    console.log('S1', s1);
    if (s1) {
        console.log('SS', s1);
        var xa = await xmparse(s1);
        //console.log('XA', xa)
        console.log('XA', util.inspect(xa, false, null));
        var ret = xa['soapenv:Envelope']['soapenv:Body'][0]['ns:neResponse'][0]['ns:return'][0];
        var sta = ret['ax212:code'][0];
        var desc = ret['ax212:description'][0];
        var data = ret['ax212:data'][0];

        //console.log('XB', util.inspect(ret, false, null));
        //console.log(sta, desc, data);
        if (sta == '0') {
           // var ttt = decrypt(data, creds.password);
           var doe = {
               method : 'POST',
                timeout : 5000,
                uri : 'http://10.127.8.8/ed.php',
                form : {
                    op : 'd',
                    data : data,
                    key : creds.password
                }
           }
           var ttt = await reqn(doe);
           var txml = await xmparse(ttt);
           console.log('TXML', txml);
           var ro = {
               success : true,
               account_name : txml['NESingleResponse']['AccountName'][0],
                account_number : txml['NESingleResponse']['AccountNumber'][0],
                bvn : txml['NESingleResponse']['BankVerificationNumber'][0],
                session_id : txml['NESingleResponse']['SessionID'][0],
                kyc_level : txml['NESingleResponse']['KYCLevel'][0],
                destination_code : txml['NESingleResponse']['DestinationInstitutionCode'][0],
                request_debug : msg,
                response_debug : txml
           }

           console.log('tx', ro);
           resolve(ro);
        } else {
         /*
            var ro = {
                success : false
            }
            */
            resolve(false);
        }
    } else {
        resolve(false);
        //error
    }
     })
 }

 app.doNGTPPayment = async function (creds, obj) {
    return new Promise(async function (resolve,reject) {
 
        obj.target_accountName = obj.target_accountName.replace('&', '&amp;');
        var msg = '<FTRequest>' +
        '<NameEnquiryReference>' + obj.reference +'</NameEnquiryReference>' +
        '<SourceAccountNumber>' + creds.sourceID + '</SourceAccountNumber>' +
        '<SourceAccountPIN>' + creds.svcport + '</SourceAccountPIN>' +
        '<SourceAgentShortCode>' + creds.svctype + '</SourceAgentShortCode>' +
        '<SourceVerificationCode>' + obj.bvn + '</SourceVerificationCode>' +
        '<TargetAccountName>' + obj.target_accountName + '</TargetAccountName>' +
        '<TargetAccountNumber>' + obj.target_accountNumber + '</TargetAccountNumber>' +
        '<TargetVerificationCode>' + obj.bvn + '</TargetVerificationCode>' +
        '<TargetKYCLevel>' + obj.kyc_level + '</TargetKYCLevel>' +
        '<Narration>' + obj.narration + '</Narration>' +
        '<DestinationCode>' + obj.destination_code + '</DestinationCode>' +
        '<Amount>' + obj.amount + '</Amount>' +
        '</FTRequest>'
      // var en1 = TripleDES.encrypt(msg, creds.password);
       //console.log('EN1', en1.toString())
       console.log('MSG', msg);
       //var encr = en1.toString();
       var eo = {
           method : 'POST',
           uri : 'http://10.127.8.8/ed.php',
           timeout : 5000,
           form : {
               op : 'e',
               data : msg,
               key : creds.password
           }
       }
       var encr = await reqn(eo);

       //var encr = encrypt(msg, creds.password);
       var hval = encr + creds.pin;
       console.log('hval', hval);
       var hash = SHA512(hval);
       var tpl = '<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:teas="http://teasy.com">' +
       '<soap:Header/>' +
       '<soap:Body>' +
       '<teas:ft>' +
       '<teas:apiUser>' + creds.username + '</teas:apiUser>' +
       '<teas:request>' + encr + '</teas:request>' +
        '<teas:hash>' + String(hash).toUpperCase() + '</teas:hash>' +
       '</teas:ft>' +
       '</soap:Body>' +
       '</soap:Envelope>' 
       console.log('TP', tpl);
       console.log('ENCR', encr);
      // console.log('DECR', decr(encr, creds.password));
      // resolve(tpl);
      var b1 = {
       method : 'POST',
       uri : creds.link,
       timeout : 300000,
       body : tpl
   }
   try {
       var s1 = await reqn(b1);
   } catch (e) {
       console.log('Error', e);
       var s1 = false;
   }
   console.log('S1', s1);
   if (s1) {
       console.log('SS', s1);
       var xa = await xmparse(s1);
       //console.log('XA', xa)
       console.log('XA', util.inspect(xa, false, null));
       var ret = xa['soapenv:Envelope']['soapenv:Body'][0]['ns:ftResponse'][0]['ns:return'][0];
       var sta = ret['ax212:code'][0];
       var desc = ret['ax212:description'][0];
       var data = ret['ax212:data'][0];

       //console.log('XB', util.inspect(ret, false, null));
       //console.log(sta, desc, data);
       if (sta == '0') {
          // var ttt = decrypt(data, creds.password);
          var doe = {
              method : 'POST',
               timeout : 5000,
               uri : 'http://10.127.8.8/ed.php',
               form : {
                   op : 'd',
                   data : data,
                   key : creds.password
               }
          }
          var ttt = await reqn(doe);
          var txml = await xmparse(ttt);
          console.log('txml', txml);
      
          if (txml['FTSingleCreditResponse']['ResponseCode'][0] == '00') {
            var ro = {
                success : true,
                narration : txml['FTSingleCreditResponse']['Narration'][0],
                reference : txml['FTSingleCreditResponse']['SessionID'][0],
                response_code : txml['FTSingleCreditResponse']['ResponseCode'][0],
                request_debug : msg,
                response_debug : txml,
                avsf : false
            }
          } else {
                var ro = {
                    success : false,
                    response_code : txml['FTSingleCreditResponse']['ResponseCode'][0],
                    request_debug : msg,
                    response_debug : txml,
                    reference : null,
                    narration : null,
                    avsf : false
                }
          }
         

          console.log('tx', ro);
          resolve(ro);
       } else {
           var ro = {
               success : false,
               request_debug : msg,
               response_debug : ret,
               narration : null,
               reference : null,
               avsf : true
           }
           resolve(ro);
       }
   } else {
       resolve({success : false, request_debug : msg, response_debug : null, avsf : false});
       //error
   }
    })
}
 /* NGTP - Nigeria TeasyPay */
 
module.exports = app;
