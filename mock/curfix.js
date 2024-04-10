require('dotenv').config({path: './../.env'});
const Operator = require('../models/operator');
const fs = require('fs');
const csv = require('csv-parser');

const myArgs = process.argv.slice(2);
const promises = [];
fs.createReadStream(myArgs[0]).pipe(
    csv()
).on('data', (row)=> {
    promises.push(new Promise(function (resolve, reject) {
        Operator.find({country_code: row[0]}).then(curs => {
            curs.forEach(cur => {
                Operator.update({_id: cur._id}, {
                    $set: {
                        min_length: row[5],
                        max_length: row[9]
                    }
                }).then(() => {
                    resolve();
                })
            })
        })
    }));

    
    
}).on('end', () => {
    Promise.all(promises).then(() => process.exit(1));
});