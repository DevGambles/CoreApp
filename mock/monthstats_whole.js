require('dotenv').config({path: './../.env'});

const run = require('./stat_whole');
const {MonthDateFormatter, MonthStatTimer} = require('./stat_timer');
const MonthStat = require('../models/monthstat');
const myArgs = process.argv.slice(2);
let fromDate;
if(myArgs.length) {
    fromDate = new Date(myArgs[0]);
}

const runner = require('./stat_runners').onceRunner;

runner(run.bind(null, new MonthStatTimer(fromDate), new MonthDateFormatter(), MonthStat))
