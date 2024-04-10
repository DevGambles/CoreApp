require('dotenv').config({path: './../.env'});
const YearlyCore = require('../models/yearlycore');

const run = require('./stat_core');
const {YearDateFormatter, YearlyStatTimer} = require('./stat_timer');

const runner = require('./stat_runners').onceRunner;

runner(run.bind(null, new YearlyStatTimer(), new YearDateFormatter(), YearlyCore))
