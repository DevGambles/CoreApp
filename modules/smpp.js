var app = {};
var smpp = require('smpp');
app.send = function (source, dest, text) {
    return new Promise(function (resolve, reject) {
        var session = smpp.connect(process.env.SMPP_HOST);
            session.bind_transceiver({
                system_id : process.env.SMPP_USER,
                password: process.env.SMPP_PASS
            }, function(pdu) {
                if (pdu.command_status == 0) {
                    // Successfully bound 
                    session.submit_sm({
                        source_addr : source,
                        destination_addr: dest,
                        short_message: text
                    }, function(pdu) {
                        if (pdu.command_status == 0) {
                            // Message successfully sent 
                            console.log('SENT', pdu.message_id);
                            resolve(pdu.message_id);
                        }
                    });
                } else {
                    console.log('boo', pdu);
                    reject();
                }
            });
    })
}
module.exports = app;