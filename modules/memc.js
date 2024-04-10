const CacheLib = require('memcached-promisify');
var Cache = new CacheLib({'cacheHost' : process.env.CHOST});
var app = {};
app.set = async function (key,val, exp) {
	console.log(val.toJSON());
    return await Cache.set(key, val.toJSON(), exp);
}
app.get = async function (key) {
    var c = await Cache.get(key);

    
    if ('undefined' !== typeof c) {
        if ((c !== null) && (c !== false) && (c !== '')) {
            return c;
        } else {
            return false;
        }
    } else {
        return false;
    }
}
app.del = async function (key) {
    return await Cache.del(key);
}
module.exports = app;