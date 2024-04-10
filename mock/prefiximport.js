require('dotenv').config({path: './../.env'});
const GloPrefix = require('../models/gloprefix');
const ProvMapping = require('../models/provmapping');

const myArgs = process.argv.slice(2);

const promises = [];
let line = 0;

fs.createReadStream(myArgs[0]).pipe(
    csv()
).on('data', (row) => {
    async function processRow() {
        const prfx = row[0];
        const iso = row[1];
        const op = row[2];

        line ++;

        if(op.indexOf('-') != -1) {
            const oper = op.split('-');
            const qry = await ProvMapping.findOne({
                iso: iso.toLowerCase().trim(),
                operator_name: {$regex: new RegExp(oper[1]), $options: 'i'}
            }).exec();

            if(qry !== null) {
                console.log('FOUND : ', iso, oper[1], qry.operator_name, qry.trl_id);
                const rec = {
                    prefix: prfx,
                    iso: iso.toLowerCase().trim(),
                    country: qry.country,
                    operator_name: qry.operator_name,
                    trt_id: qry.trt_id,
                    trl_id: qry.trl_id,
                    active: true,
                    time: new Date()
                }
                await GloPrefix.create(rec);
            } else {
                console.log('NOT FOUND : ', iso, oper[1]);
            }
        }
        console.log("Processing Line : ", line);
    }
    promises.push(processRow());
    
}).on('end', () => {
    Promise.all(promises).then(() => {
        process.exit(1);
    });
});