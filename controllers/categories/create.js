/* Creates a category */

'use strict';

var r     = require('rethinkdb');
var form  = require('express-form');
var field = form.field;

var can      = require('../../lib/can');
var APIError = require('../../lib/APIError');
var uidReg   = require('../../lib/uidReg');

module.exports = {
    method: 'post',
    route: '/categories/',
    validation: form(
        field('name').required().is(/^[\w\d_-]+$/)
    ),
    /**
     * This controller creates one category
     * 400 error if the category is malformed
     * 500 error if the rethinkdb request fails
     * 200 otherwise
     * Category : {
     *     name : string
     * }
     * @param  {object}   req  The request
     * @param  {object}   res  The response
     * @param  {Function} next The next middleware
     */
    controller: function (req, res, next) {
        var app  = req.app;
        var conn = app.locals.conn;
        var log  = app.locals.log;

        if (!req.session.connected)         return next(new APIError(401, 'Unauthorized', 'Not connected'));
        if (!req.form.isValid)              return next(new APIError(400, 'Bad Request', req.form.errors));
        if (!req.session.canEditCategories) return next(new APIError(401, 'Unauthorized', 'No right to edit category'));

        req.form.createdAt = new Date();
        req.form.updatedAt = new Date();
        req.form.deletedAt = null;

        console.log(req.form);

        log.debug('r.db(wiki).table(categories).insert(' + JSON.stringify(req.form) + ')');
        r.db('wiki').table('categories')
            .insert(req.form)
            .run(conn)
            .then(function (result) {
                return res
                    .status(200)
                    .json(result.generated_keys)
                    .end();
            })
            .catch(function (err) {
                return next(new APIError(500, 'SQL Server Error', err));
            });
    }
};
