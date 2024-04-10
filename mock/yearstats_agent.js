require('dotenv').config({path: './../.env'});
const YearStat = require('../models/yearstat');
const run = require('./stat_agent');
const {YearDateFormatter, YearStatTimer} = require('./stat_timer');
const myArgs = process.argv.slice(2);
let fromDate;
if(myArgs.length) {
    fromDate = new Date(myArgs[0]);
}

const runner = require('./stat_runners').onceRunner;

runner(run.bind(null, new YearStatTimer(fromDate), new YearDateFormatter(), YearStat))