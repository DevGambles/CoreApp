var app = {};
app.checkReadAccess = function (req, res, next) {
   next();
}
app.checkWriteAccess = function (req, res, next) {
    if (req.user.access_level == 'master') {
        next();
    } else {
        res.sendStatus(403);
    }
    
}
module.exports = app;
