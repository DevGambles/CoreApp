require('dotenv').config()
var co = require('co');
var https = require('co-request');
var Rate = require('./models/rate')
var BaseCurrencies = ['USD', 'EUR', 'GBP'];


        co(function *() {

      for (i=0; i < BaseCurrencies.length; i++) {
        var cur = BaseCurrencies[i];
    
                            var baa = yield https(process.env.FIXER_API + cur);
                            var b = JSON.parse(baa.body);
                           for (y=0; y < Object.keys(b.rates).length; y++) {
                               var ra = Object.keys(b.rates)[y];
                               var rab = parseFloat((parseFloat(b.rates[ra]) - ((parseFloat(b.rates[ra]) * 10) / 100)).toFixed(3))
                               console.log(ra, b.rates[ra], rab)
                               var Cra = yield Rate.findOne({source : cur, destination : ra}).exec()
                               if (Cra !== null) {
                                   if (Cra.dynamic === true) {
                                       Cra.rate = rab;
                                       Cra.time = new Date();
                                       var x = yield Cra.save();
                                   }
                               } else {
                                   var Nra = new Rate();
                                        Nra.source = cur;
                                        Nra.destination = ra;
                                        Nra.rate = rab;
                                        Nra.dynamic = true;
                                        Nra.time = new Date();
                                        var ta = yield Nra.save();
                               }
                           }
                           
      }                 
  }).catch(function (err) {
    console.error(err)
  })

setTimeout(function () {
    process.exit(0);
}, 30000)