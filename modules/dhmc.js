let app = {};
let zmq = require('zeromq');
let zreq = zmq.socket('req');
let os = require('os');
    app._init = function() {
        console.log('DHM, Connecting to ', process.env.ZeroMQString);
        zreq.connect(process.env.ZeroMQString);
        return true;
    }
    app._send = function (a) {
        return new Promise((resolve,reject) => {
            //zreq.connect(process.env.ZeroMQString);
            //console.log('Sent ', a);
            var aop = a.op;
         //   console.log('OPREQ', aop);
                zreq.send(JSON.stringify(a));
          
            
            zreq.on('message', (reply) => {
               // console.log('Received ', JSON.parse(reply));
                var zz = JSON.parse(reply);
                if (('undefined' !== typeof aop) && ('undefined' !== typeof zz.op)) {
                    if (zz.op == aop) {
                        //console.log(new Date(), 'OPMATCH', zz.op)
                        resolve(JSON.parse(reply));
                    }
                } else {
                    console.log('Warning, OP undefined', aop, reply.op);
                    resolve(JSON.parse(reply));
                }
               
            })
        })
    }
    app._startup = async function () {
        console.log('Startup event....')
        var r = {
            time : new Date(),
            hostname : os.hostname(),
            op : 'state',
            state : 'startup'
        }
        return await app._send(r);
    }
    app._ready = async function () {
        var r = {
            time : new Date(),
            hostname : os.hostname(),
            op : 'state',
            state : 'ready'
        }
        return true;
    }
    app._busy = async function () {
        var r = {
            time : new Date(),
            hostname : os.hostname(),
            op : 'state',
            state : 'busy'
        }
        return true;
    }
    app._preshutdown = async function () {

        var r = {
            time : new Date(),
            hostname : os.hostname(),
            op : 'state',
            state : 'preshutdown'
        }
        return await app._send(r);
    }
/*
function doGetNGMTSim(a) {
    return new Promise((resolve,reject) => {
        var zreq = zmq.socket('req');
        zreq.connect(process.env.ZeroMQString);
        var r = {
            op : 'getMTNSim',
            time : new Date(),
            hostname : os.hostname(),
            _id : a
        }
        zreq.send(JSON.stringify(r));
        zreq.on('message', (reply) => {
            var x = JSON.parse(reply.toString());
            zreq.close();
            resolve(x.reply);
        })
    })
}
*/

module.exports = app;