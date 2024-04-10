require('dotenv').config({path: './../.env'});
const GloPrefix = require('../models/gloprefix');
const ProvMapping = require('../models/provmapping');
const TriangloPrice = require('../models/triangloprice');

const myArgs = process.argv.slice(2);
const promises = [];
let line = 0;

fs.createReadStream(myArgs[0]).pipe(
    csv()
).on('data', (row) => {
    if(row[1] == 'Country') {
        return;
    }
    const rec = {
        operator_id: row[0],
        country: row[1],
        operator_name: row[2].replace(row[1], ''),
        currency: row[3],
        min_denomination: row[4],
        max_denomination: row[5],
        step: row[6],
        unit_cost: row[7],
        rate: row[8]
    };
    console.log(rec);
    promises.push(TriangloPrice.create(rec));
}).on('end', () => {
    Promise.all(promises).then(() => {process.exit(1)});
})
