require('dotenv').config({path: './../.env'});
const WeekCore = require('../models/weekcore');
const run = require('./stat_core');
const {MonthDateFormatter, WeekStatTimer} = require('./stat_timer');

const runner = require('./stat_runners').onceRunner;
const myArgs = process.argv.slice(2);
let fromDate;
if(myArgs.length) {
    fromDate = new Date(myArgs[0]);
}

runner(run.bind(null, new WeekStatTimer(fromDate), new MonthDateFormatter(), WeekCore))
