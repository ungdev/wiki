/* Deletes a category */

'use strict';

var r     = require('rethinkdb');
var form  = require('express-form');
var field = form.field;

var can      = require('../../lib/can');
var APIError = require('../../lib/APIError');

module.exports = {
    method: 'delete',
    route: '/categories/:uid([0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})/:move([0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})',
    /**
     * This controller deletes one category
     * 400 error if the category is malformed
     * 404 error if the category is not found
     * 500 error if the rethinkdb request fails
     * 200 otherwise
     * @param  {object}   req  The request
     * @param  {object}   res  The response
     * @param  {Function} next The next middleware
     */
    controller: function (req, res, next) {
        var app  = req.app;
        var conn = app.locals.conn;
        var log  = app.locals.log;

        if (!req.session.connected)         return next(new APIError(401, 'Unauthorized', 'Not connected'));
        if (!req.session.canEditCategories) return next(new APIError(401, 'Unauthorized', 'Not desk member'));

        var deleter        = { deletedAt: new Date() };
        var actualArticles = { category: req.params.uid };
        var updater        = { category: req.params.move };

        log.debug('r.db(wiki).table(articles).filter(' + JSON.stringify(actualArticles) + ').update(' + JSON.stringify(updater) + ')');
        r.db('wiki').table('articles')
            .filter(actualArticles)
            .update(updater)
            .run(conn)
            .then(function () {
                log.debug('r.db(wiki).table(categories).get(' + req.params.uid + ').update(' + JSON.stringify(deleter) + ')');
                return r.db('wiki').table('categories')
                    .get(req.params.uid)
                    .update(deleter)
                    .run(conn);
            })
            .then(function (result) {
                if (result.skipped === 1) {
                    return next(new APIError(404, 'Not Found', result));
                }
                return res
                    .status(200)
                    .json(result)
                    .end();
            })
            .catch(function (err) {
                return next(new APIError(500, 'SQL Server Error', err));
            });
    }
};
