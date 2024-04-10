require('dotenv').config({path: './../.env'});
const MonthStat = require('../models/monthstat');
const run = require('./stat_agent');
const {MonthDateFormatter, MonthStatTimer} = require('./stat_timer');
const myArgs = process.argv.slice(2);
let fromDate;
if(myArgs.length) {
    fromDate = new Date(myArgs[0]);
}

const runner = require('./stat_runners').onceRunner;

runner(run.bind(null, new MonthStatTimer(fromDate), new MonthDateFormatter(), MonthStat))

