require('dotenv').config({path: './../.env'});
const DailyStat = require('../models/dailystat');
const run = require('./stat_agent');
const {DayDateFormatter, DailyStatTimer} = require('./stat_timer');

const runner = require('./stat_runners').onceRunner;

runner(run.bind(null, new DailyStatTimer(), new DayDateFormatter(), DailyStat))
