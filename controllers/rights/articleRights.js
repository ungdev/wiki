/* List one article's rights*/

'use strict';

var form  = require('express-form');
var field = form.field;

module.exports = {
    method: 'get',
    route: '/articles/:uid([0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})/rights/',
    /**
     * This controller lists one article's rights
     * 404 error if the given uid is not in the database
     * 500 error if the rethinkdb request fails
     * 200 otherwise
     * @param  {object}   req  The request
     * @param  {object}   res  The response
     * @param  {Function} next The next middleware
     */
    controller: function (req, res, next) {
        var app      = req.app;

        var r        = app.locals.r;
        var conn     = app.locals.conn;
        var APIError = app.locals.APIError;
        var log      = app.locals.log;

        if (!req.session.connected) {
            return next(new APIError(401, 'Unauthorized'));
        }

        var uid = req.params.uid;

        log.debug('r.db(wiki).table(rights).filter(r.row(article).eq(' + uid + '))');
        r.db('wiki').table('rights')
            .filter(r.row('article').eq(uid))
            .filter(r.row('deletedAt').eq(null))
            .run(conn)
            .then(function (articleRights) {
                return articleRights.toArray();
            })
            .then(function (articleRights) {
                return res
                    .status(200)
                    .json(articleRights)
                    .end();
            })
            .catch(function (err) {
                return next(new APIError(500, 'SQL Server Error', err));
            });
    }
};
