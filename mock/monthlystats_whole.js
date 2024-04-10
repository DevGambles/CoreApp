require('dotenv').config({path: './../.env'});
const MonthlyStat = require('../models/monthlystat');

const run = require('./stat_whole');
const {MonthDateFormatter, MonthlyStatTimer} = require('./stat_timer');

const runner = require('./stat_runners').onceRunner;

runner(run.bind(null, new MonthlyStatTimer(), new MonthDateFormatter(), MonthlyStat))
