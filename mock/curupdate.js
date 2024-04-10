require('dotenv').config({path: './../.env'});
const Currency = require('../models/currency');
const fs = require('fs');
const csv = require('csv-parser');

const myArgs = process.argv.slice(2);
const promises = [];

fs.createReadStream(myArgs[0]).pipe(
    csv()
).on('data', (row)=> {
    console.log('CurSymbol : ' + row[2] + ' Name : ' + row[1]);
    const arr = {
        symbol: row[2],
        name: row[1]
    };

    promises.push(Currency.create(arr));
}).on('end', () => {
    Promise.all(promises).then(() => {
        process.exit(1);
    })
});