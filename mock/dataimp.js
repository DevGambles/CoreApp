require('dotenv').config({path: './../.env'});
const DataProd = require('../models/dataprod');
const fs = require('fs');
const csv = require('csv-parser');

const myArgs = process.argv.slice(2);

async function run() {
    await DataProd.deleteMany({}).exec();
    await new Promise(function (resolve, reject) {
        const promises = [];

        fs.createReadStream(myArgs[0]).pipe(
            csv()
        ).on('data', (row)=> {
            const obj = {
                apid: row[0],
                iso: row[1],
                acloperid: row[2],
                sku: row[3],
                psku: row[4],
                use_psku: !!row[5],
                name: row[6],
                operator_id: row[7],
                data_amount: row[8],
                topup_price: parseInt(row[9]),
                topup_currency: row[10],
                price: row[11],
                step: row[12],
                fx_rate: parseFloat(row[13]),
                currency: row[14],
                active: !!row[15],
                country: row[16]
            };
            promises.push(DataProd.create(obj));

        }).on('end', () => {
            Promise.all(promises).then(() => resolve()).catch(()=> {resolve()});
        });
    });

    process.exit(1);
}

run();