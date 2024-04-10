require('dotenv').config({path: './../.env'});
const YearlyStat = require('../models/yearlystat');
const run = require('./stat_agent');
const {YearDateFormatter, YearlyStatTimer} = require('./stat_timer');

const runner = require('./stat_runners').onceRunner;

runner(run.bind(null, new YearlyStatTimer(), new YearDateFormatter(), YearlyStat))
