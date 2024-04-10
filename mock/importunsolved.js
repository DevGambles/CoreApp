require('dotenv').config({path: './../.env'});
const fs = require('fs');
const csv = require('csv-parser');
const ProvMapping = require('../models/provmapping');

const myArgs = process.argv.slice(2);

async function run() {
    await new Promise((resolve, reject) => {
        const promises = [];
        fs.createReadStream(myArgs[0]).pipe(
            csv()
        ).on('data', (row) => {
            const rec = {
                country: row[0],
                operator_name: row[1],
                trt_id: row[2],
                trl_id: row[3]
            }
    
            promises.push(ProvMapping.create(rec));
            console.log('IMPORTING : ', row[1]);
        }).on('end', () => {
            Promise.all(promises).then(() => resolve());
        });
    })
    
    process.exit(1);
}

run();