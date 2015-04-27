/* List articles, or get one's details */

'use strict';

var form  = require('express-form');
var field = form.field;

module.exports = {
    method: 'get',
    route: [
        '/articles/:uid([0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})',
        '/articles/'
    ],
    /**
     * This controller list all articles, or just one
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

        var uid = req.params.uid;

        if (uid) {
            log.debug('r.db(wiki).table(articles).get(' + uid + ')');
            r.db('wiki').table('articles')
                .get(uid)
                .filter(r.row('deletedAt').eq(null))
                .run(conn)
                .then(function (article) {
                    if (!article) {
                        return next(new APIError(404, 'Not Found'));
                    }

                    return res
                        .status(200)
                        .json(article)
                        .end();
                })
                .catch(function (err) {
                    return next(new APIError(500, 'SQL Server Error', err));
                });
        } else {
            log.debug('r.db(wiki).table(articles).filter(r.row(deletedAt).eq(null).toArray()');
            r.db('wiki').table('articles')
                .filter(r.row('deletedAt').eq(null))
                .run(conn)
                .then(function (articles) {
                    return articles.toArray();
                })
                .then(function (articles) {
                    return res
                        .status(200)
                        .json(articles)
                        .end();
                })
                .catch(function (err) {
                    return next(new APIError(500, 'SQL Server Error', err));
                });
        }
    }
};
