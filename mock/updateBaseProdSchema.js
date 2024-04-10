require('dotenv').config({path: './../.env'});
const BaseProd = require('../models/baseprod');

async function run() {
    const a = await BaseProd.find().exec();
    for(let b of a) {
        const s = b.sku.split('-');
        await BaseProd.update({_id: b._id}, {
            $set: {
                apid: s[0]
            }
        }).exec();
    }

    process.exit(1);
}

run();