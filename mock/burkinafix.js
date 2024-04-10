require('dotenv').config({path: './../.env'});
const GloPrefix = require('../models/gloprefix');
const fs = require('fs');
const csv = require('csv-parser');

const myArgs = process.argv.slice(2);

const promises = [];
fs.createReadStream(myArgs[0]).pipe(
    csv()
).on('data', (row)=> {
    const rec = {
        prefix: row[0],
        iso: 'bf',
        country: 'Burkina Faso',
        operator_name: 'Orange',
        trt_id: '99999',
        trl_id: 'BF_OR',
        active: true,
        time: new Date()
    };
    promises.push(GloPrefix.create(rec));
}).on('end', () => {
    Promise.all(promises).then(() => {
        process.exit(1);
    });
});