var sha1 = require('sha1');


var checkAuth = function(input) {
    var salt = process.env.PSWD_SALT;
    var ps = sha1(input);
    var ss = sha1(salt);
    var ha = sha1(ps + ss);
    return ha;
}
module.exports = checkAuth;