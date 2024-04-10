require('dotenv').config({path: './../.env'});
const DayCore = require('../models/daycore');
const runFunc = require('./stat_core');
const {DayDateFormatter, DayStatTimer} = require('./stat_timer');

const myArgs = process.argv.slice(2);
let fromDate;
if(myArgs.length) {
    fromDate = new Date(myArgs[0]);
}

const statTimer = new DayStatTimer(fromDate);
const dateFormatter = new DayDateFormatter();
const runner = require('./stat_runners').onceRunner;

async function run() {
    if(fromDate) {
        await runFunc(statTimer, dateFormatter, DayCore);
    } else {
        for(let hourDiff = 24; hourDiff >=1; hourDiff --) {
            statTimer.setSteps(hourDiff);
            await runFunc(statTimer, dateFormatter, DayCore);
        }
    }
    
}

runner(run)
