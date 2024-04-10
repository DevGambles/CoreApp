require('dotenv').config()
var Apibalance = require('../models/apibalance')
var Apibalhistory = require('../models/apibalhistory')
//const puppeteer = require('puppeteer');
//const browser = puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'], ignoreHTTPSErrors: true, dumpio: false });
const puppeteer = require('puppeteer');

var run = async (obj) => {
    const browser = await puppeteer.launch({ignoreHTTPSErrors : true});
    const page = await browser.newPage();
    await page.setViewport({width : 1000, height : 1000})
    await page.goto('https://cpeportal.9mobile.com.ng/login.action', {waitUntil : 'load'});
    await page.select("select#loginBy", "2");
    await page.focus('input#username');
    await page.keyboard.type(obj.user);
    await page.focus('input#password');
    await page.keyboard.type(obj.pass);
    await page.click('#submitBtn');
    await page.waitForNavigation({waitUntil: 'load'});
    await page.waitFor(5000);
   const fra = await page.frames();
    
   // console.log(fra[12]._name, fra[12]._navigationURL)
  /// await page.goto(fra[12]._navigationURL, {waitUntil : 'load'});
  // await page.$eval('#qth', el => el.click());
    //*[@id="pro_linke"]
    var li = await fra[12].$x('//*[@id="qth"]/h2/a');
    if (li.length > 0) {
       // console.log('LI', li)
       await li[0].click();
    } else {
        console.log('BRrr')
    }
   
    await page.setViewport({width : 1000, height : 1000})
    await page.mouse.move(0, 0);
    await page.waitFor(1000);
await page.mouse.click(800, 177);
await page.waitFor(1000);
const fra2 = await page.frames();

const data = await fra2[13].$eval('#queryATMRechargeLogList_ATM_0_11 > span > label', x => x.title);
  
  //[ 'One', 'Two', 'Three', 'Four' ]
  console.log(data);
  return data;
    /*
    var frames = await page.frames();
    //console.log(frames);
    
    var li = await page.$x('//*[@id="qth"]/img');
    if (li.length > 0) {
        await li[0].click();
    } else {
        console.log('BRrr')
    }
    
    /*
    var linkHandlers = await page.$x('//*[@id="qth"]/img');
    if (linkHandlers.length > 0) {
        await linkHandlers[0].click();
      } else {
        throw new Error("Link not found");
      }
      */
}
(async () => {
    var crds = [
        {
            tag : 'RINGO',
            apicode : 'NGET',
            user : '11234568',
            pass : 'Ringo@Plus@PA888',
            username : 'OfficeDevices',
            currency : 'NGN'
        }
    ];
    crds.forEach(async function (creds) {
        var bal = await run(creds);
        await Apibalance.findOneAndUpdate({code : creds.apicode, subcode : creds.username, tag : creds.tag}, {code : creds.apicode, subcode : creds.username, tag : creds.tag, balance : bal, currency : creds.currency, lastCheck : new Date()}, {upsert : true}).exec()
        var n = new Apibalhistory({
            code : creds.apicode,
            subcode : creds.username,
            tag : creds.tag,
            balance : bal,
            currency : creds.currency,
            lastCheck : new Date(),
            time : new Date()
        })
        var x = await n.save();
	console.log(x);
    })
     setTimeout(function () { process.exit(0) }, 45000);
})();

