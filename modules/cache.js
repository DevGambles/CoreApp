let app = {};
let Redis = require('ioredis')
let redis = new Redis("6379", "127.0.0.1");
app.set = async (k, v, e) => {
    var valueStr = v;
    
    try{
        valueStr = JSON.stringify(v);
    } catch(e) {
        console.log('Cache - Failed to serialize to json');
        return false;
    }
    
    var x = await redis.set(k, valueStr, 'EX', e);
    if (x) {
        return x;
    } else {
        return false;
    }
}
app.get = async (k) => {
    var x = await redis.get(k);

    console.log('Get cache value - ', k);

    if(!x) return false;

    try {
        x = JSON.parse(x);
    } catch(e) {
        console.log('Cache - Invalid json was saved', e);
        return false;
    }
    
    return x;
}
app.del = async (k) => {
    return await redis.del(k);
}
module.exports = app;