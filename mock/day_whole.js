require('dotenv').config({path: './../.env'});
const DayStat = require('../models/daystat');
const runFunc = require('./stat_whole');
const {DayDateFormatter, DayStatTimer} = require('./stat_timer');
const myArgs = process.argv.slice(2);
let fromDate;
if(myArgs.length) {
    fromDate = new Date(myArgs[0]);
}

const statTimer = new DayStatTimer(fromDate);

const runner = require('./stat_runners').onceRunner;

async function run() {
    if(fromDate) {
        await runFunc(statTimer, new DayDateFormatter(), DayStat);
    } else {
        for(let hourDiff = 24; hourDiff >=1; hourDiff --) {
            statTimer.setSteps(hourDiff);
            await runFunc(statTimer, new DayDateFormatter(), DayStat);
        }
    }
    
}

runner(run)
