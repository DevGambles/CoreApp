require('dotenv').config({path: './../.env'});
const TicketMsg = require('../models/ticketmsg');
const User = require('../models/user');

async function run() {
    const a = await TicketMsg.find().exec();
    for(let b of a) {
        const x = await User.findOne({_id: b.author}).exec();
        if(x !== null) {
            const newname = x.first_name + ' ' + x.last_name;
            console.log('Updating : ' + newname);
            await TicketMsg.update({_id: b._id}, {
                $set: {
                    author_name: newname
                }
            }).exec();
        } else {
            console.log('Could not find user with ID : ', b.author);
        }
    }

    process.exit(1);
}

run();