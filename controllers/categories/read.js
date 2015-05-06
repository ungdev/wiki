/* List categories */

'use strict';

var r     = require('rethinkdb');
var form  = require('express-form');
var field = form.field;

var can      = require('../../lib/can');
var APIError = require('../../lib/APIError');

module.exports = {
    method: 'get',
    route: '/categories/',
    /**
     * This controller lists all categories
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

        if (!req.session.connected)         return next(new APIError(401, 'Unauthorized', 'Not connected'));
        if (!req.session.canEditCategories) return next(new APIError(401, 'Unauthorized', 'Not desk member'));

        log.debug('r.db(wiki).table(categories).filter(r.row(deletedAt).eq(null).toArray()');
        r.db('wiki').table('categories')
            .filter(r.row('deletedAt').eq(null))
            .run(conn)
            .then(function (categories) {
                return categories.toArray();
            })
            .then(function (categories) {
                return res
                    .status(200)
                    .json(categories)
                    .end();
            })
            .catch(function (err) {
                return next(new APIError(500, 'SQL Server Error', err));
            });
    }
};
