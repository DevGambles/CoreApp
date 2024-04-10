require('dotenv').config({path: './../.env'});
const MonthlyCore = require('../models/monthlycore');
const run = require('./stat_core');
const {MonthDateFormatter, MonthlyStatTimer} = require('./stat_timer');

const runner = require('./stat_runners').onceRunner;

runner(run.bind(null, new MonthlyStatTimer(), new MonthDateFormatter(), MonthlyCore))