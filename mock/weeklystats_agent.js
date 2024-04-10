require('dotenv').config({path: './../.env'});
const WeeklyStat = require('../models/weeklystat');

const run = require('./stat_agent');
const {MonthDateFormatter, WeeklyStatTimer} = require('./stat_timer');

const runner = require('./stat_runners').onceRunner;

runner(run.bind(null, new WeeklyStatTimer(), new MonthDateFormatter(), WeeklyStat))
