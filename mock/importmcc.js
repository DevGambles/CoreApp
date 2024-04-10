require('dotenv').config({path: './../.env'});
const fs = require('fs');
const csv = require('csv-parser');
const Operator = require('../models/operator');

const myArgs = process.argv.slice(2);

async function run() {
    await new Promise((resolve, reject) => {
        const promises = [];
        fs.createReadStream(myArgs[0]).pipe(
            csv()
        ).on('data', (row) => {
            console.log('MCC :' + row[0] + 
                        '/MNC : ' + row[1] + 
                        '/ISO :' + row[2] + 
                        '/COUNTRY: ' + row[3] +  
                        '/CALLCODE :' + row[4] + 
                        '/OPNAME : ' + row[5]);
            const rec = {};
            rec.mcc = row[0];
            rec.mnc = row[1];
            rec.iso = row[2];
            rec.country = row[3];
            rec.country_code = row[4];
            rec.operator_name = row[5];
            promises.push(Operator.create(rec));
        }).on('end', () => {
            Promise.all(promises).then(() => resolve());
        });
    })
    process.exit(1);
}

run();