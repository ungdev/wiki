/* List articles, or get one's details */

'use strict';

var r     = require('rethinkdb');
var form  = require('express-form');
var field = form.field;

var can      = require('../../lib/can');
var APIError = require('../../lib/APIError');
var uid      = require('../../lib/uidReg');

module.exports = {
    method: 'get',
    route: [
        '/articles/:uid(' + uid + ')',
        '/articles/'
    ],
    /**
     * This controller lists all articles, or just one
     * 404 error if the given uid is not in the database
     * 500 error if the rethinkdb request fails
     * 200 otherwise
     * @param  {object}   req  The request
     * @param  {object}   res  The response
     * @param  {Function} next The next middleware
     */
    controller: function (req, res, next) {
        var app  = req.app;
        var conn = app.locals.conn;
        var log  = app.locals.log;

        if (!req.session.connected) return next(new APIError(401, 'Unauthorized', 'Not connected'));

        var uid = req.params.uid;

        if (uid) {
            can(app)
                .view(req.session.userData.id, uid)
                .then(function (canView) {
                    if (!canView) return next(new APIError(401, 'Unauthorized', 'No right to view'));

                    log.debug('r.db(wiki).table(articles).get(' + uid + ')');
                    return r.db('wiki').table('articles')
                        .get(uid)
                        .run(conn)
                })
                .then(function (article) {
                    if (!article || article.deletedAt !== null) return next(new APIError(404, 'Not Found'));

                    return res
                        .status(200)
                        .json(article)
                        .end();
                })
                .catch(function (err) {
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
                    var articlesAllowed = [];
                    if (articles.length === 0) {
                        return res
                            .status(200)
                            .json([])
                            .end();
                    }

                    articles.forEach(function (article, i) {
                        can(app)
                            .view(req.session.userData.id, article.id)
                            .then(function (canView) {
                                if (canView) articlesAllowed.push(article);

                                if (i === articles.length - 1) {
                                    return res
                                        .status(200)
                                        .json(articlesAllowed)
                                        .end();
                                }
                            })
                            .catch(function (err) {
                                return next(new APIError(500, 'SQL Server Error', err));
                            });
                    });
                })
                .catch(function (err) {
                    return next(new APIError(500, 'SQL Server Error', err));
                });
        }
    }
};
