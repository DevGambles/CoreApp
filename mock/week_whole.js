require('dotenv').config({path: './../.env'});
const WeekStat = require('../models/weekstat');

const run = require('./stat_whole');
const {MonthDateFormatter, WeekStatTimer} = require('./stat_timer');
const myArgs = process.argv.slice(2);
let fromDate;
if(myArgs.length) {
    fromDate = new Date(myArgs[0]);
}

const runner = require('./stat_runners').onceRunner;

runner(run.bind(null, new WeekStatTimer(fromDate), new MonthDateFormatter(), WeekStat))
