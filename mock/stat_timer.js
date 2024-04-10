const moment = require('moment');


function MonthDateFormatter() {}

MonthDateFormatter.prototype.format = function (date) {
    return moment(date).format('DD.MM.YYYY');
}

MonthDateFormatter.prototype.aggregate = function () {
    return {
        time_month: {$month: '$time'},
        time_date: {$dayOfMonth: '$time'}
    }
}

MonthDateFormatter.prototype.compare = function (fromDate, toDate, destTopup) {
    return (destTopup._id.time_month == fromDate.getMonth() + 1 && 
        destTopup._id.time_date == fromDate.getDate());
}

function YearDateFormatter() {}
YearDateFormatter.prototype.format = function (date) {
    return moment(date).format('MM.YYYY');
}
YearDateFormatter.prototype.aggregate = function () {
    return {
        time_year: {$year: '$time'},
        time_month: {$month: '$time'},
    }
}
YearDateFormatter.prototype.compare = function (fromDate, toDate, destTopup) {
    return (destTopup._id.time_month === fromDate.getMonth() + 1 && 
        destTopup._id.time_year === fromDate.getFullYear());
}

function DayDateFormatter() {}
DayDateFormatter.prototype.format = function(date) {
    return moment(date).format('HH:00');
}
DayDateFormatter.prototype.aggregate = function () {
    return {
        time_date: {$dayOfMonth: '$time'},
        time_hour: {$hour: '$time'}
    }
}
DayDateFormatter.prototype.compare = function (fromDate, toDate, destTopup) {
    return (destTopup._id.time_date === fromDate.getDate() && 
        destTopup._id.time_hour === fromDate.getHours());
}

function DailyStatTimer() {
    const currentTime = new Date();
    this.time = currentTime;
    this.end = new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate(), currentTime.getHours() + 1, 0, 0);
    this.start = new Date(this.end.getTime() - 86400000);
    this.steps = 24;
}
DailyStatTimer.prototype.timeSpanInStep = function (step) {
    const start = new Date(this.end.getTime() - 3600000 * step);
    const end = new Date(start.getTime() + 3600000);
    return {start, end}
}

function DayStatTimer(date) {
    const currentTime = new Date();
    const fromDate = date || currentTime;
    const y = fromDate.getFullYear();
    const m = fromDate.getMonth();
    const d = fromDate.getDate();
    const h = fromDate.getHours();

    this.end = new Date(y, m, d, h + 1, 0, 0);
    this.start = new Date(y, m, d - 1, h + 1, 0, 0);
    this.time = currentTime > this.end ? this.end : currentTime;
    this.steps = 24;
}

DayStatTimer.prototype.timeSpanInStep = function (step) {
    const start = new Date(this.end.getTime() - 3600000 * step);
    const end = new Date(start.getTime() + 3600000);
    return {start, end}
}

DayStatTimer.prototype.setSteps = function (steps) {
    this.steps = steps;
    this.start = new Date(this.end.getTime() - 3600000 * steps);
}

function MonthStatTimer(date) {
    const currentTime = new Date();
    const fromDate = date || currentTime;
    
    const y = fromDate.getFullYear();
    const m = fromDate.getMonth();
    const d = fromDate.getDate();
    const h = fromDate.getHours();

    this.steps = 0;
    
    this.start = new Date(y, m);
    this.end = new Date(y, m + 1);
    this.time = currentTime > this.end ? this.end : currentTime;

    this.steps = new Date(y, m + 1, 0).getDate();
}

MonthStatTimer.prototype.timeSpanInStep = function (step) {
    if(step > this.steps || this.steps <= 0)
        return;

    const start = new Date(this.end.getTime() - 86400000 * step);
    const end = new Date(start.getTime() + 86400000);
    return { start, end }
}

function MonthlyStatTimer() {
    let currentTime = new Date();
    this.end = new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate() + 1);
    this.start = new Date(this.end.getTime() - 86400000 * 30);
    this.time = currentTime;
    this.steps = 30;
}

MonthlyStatTimer.prototype.timeSpanInStep = function(step) {
    if(step > this.steps || this.steps <= 0)
        return;

    const start = new Date(this.end.getTime() - 86400000 * step);
    const end = new Date(start.getTime() + 86400000);
    return { start, end }
}

function WeekStatTimer(date) {
    const currentTime = new Date();
    const fromDate = currentTime || date;
    const y = fromDate.getFullYear();
    const m = fromDate.getMonth();
    const d = fromDate.getDate();
    const h = fromDate.getHours();
    const min = fromDate.getMinutes();
    const s = fromDate.getSeconds();
    const w = fromDate.getDay();

    let start;
    let end = new Date(y, m, d, 24);
    
    if(w != 0) {
        end = new Date(y, m, d + (8 - w));
    }
    start = new Date(end.getTime() - 86400000 * 7);

    this.start = start;
    this.end = end;
    this.time = currentTime > this.end ? this.end : currentTime;;
    this.steps = 7;
}

WeekStatTimer.prototype.timeSpanInStep = function (step) {
    const start = new Date(this.end.getTime() - 86400000 * step);
    const end = new Date(start.getTime() + 86400000);
    return {start, end}
}

function WeeklyStatTimer() {
    const currentTime = new Date();
    this.end = new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate() + 1);
    this.start = new Date(this.end.getTime() - 86400000 * 7);
    this.time = currentTime;
    this.steps = 7;
}
WeeklyStatTimer.prototype.timeSpanInStep = function (step) {
    const start = new Date(this.end.getTime() - 86400000 * step);
    const end = new Date(start.getTime() + 86400000);
    return {start, end}
}

function YearStatTimer(date) {
    const currentTime = new Date();
    const fromDate = currentTime || date;
    const y = fromDate.getFullYear();
    const m = fromDate.getMonth();
    const d = fromDate.getDate();
    const h = fromDate.getHours();
    const min = fromDate.getMinutes();
    const s = fromDate.getSeconds();
    const w = fromDate.getDay();

    let start = new Date(y, 0, 1);
    let end = new Date(y + 1, 0, 1);
    
    
    this.start = start;
    this.end = end;
    this.time = currentTime > this.end ? this.end : currentTime;
    this.steps = 12;
}
YearStatTimer.prototype.timeSpanInStep = function (step) {
    const y = this.end.getFullYear();
    const m = this.end.getMonth();
    const start = new Date(y, m - step, 1);
    const end = new Date(y, m - step + 1, 1);
    return {start, end}
}

function YearlyStatTimer(date) {
    const currentTime = new Date();
    const fromDate = currentTime || date;

    const y = fromDate.getFullYear();
    const m = fromDate.getMonth();
    const d = fromDate.getDate();
    const h = fromDate.getHours();
    const min = fromDate.getMinutes();
    const s = fromDate.getSeconds();
    const w = fromDate.getDay();

    this.end = new Date(y, m, d + 1);
    this.start = new Date(y - 1, m, d + 1);
    this.steps = 12;
    this.time = currentTime > this.end ? this.end : currentTime;
}

YearlyStatTimer.prototype.timeSpanInStep = function (step) {
    const y = this.end.getFullYear();
    const m = this.end.getMonth();
    const d = this.end.getDate();

    const start = new Date(y, m - step, d);
    const end = new Date(y, m - step + 1, d);
    return {start, end}
}

module.exports = {
    DayDateFormatter, 
    MonthDateFormatter, 
    YearDateFormatter, 
    MonthStatTimer, 
    MonthlyStatTimer,
    WeekStatTimer,
    WeeklyStatTimer,
    YearlyStatTimer, 
    YearStatTimer, 
    DailyStatTimer,
    DayStatTimer
}