/* Creates a right */

'use strict';

var r     = require('rethinkdb');
var form  = require('express-form');
var field = form.field;

var can      = require('../../lib/can');
var APIError = require('../../lib/APIError');
var uidReg   = require('../../lib/uidReg');

module.exports = {
    method: 'post',
    route: '/rights/',
    validation: form(
        field('article').required().is(new RegExp('/^' + uidReg + '$/')),
        field('user').required().is(/^[\w\d_-]+$/),
        field('view').required().toBooleanStrict(),
        field('edit').required().toBooleanStrict()
    ),
    /**
     * This controller creates one right
     * 400 error if the right is malformed
     * 500 error if the rethinkdb request fails
     * 200 otherwise
     * Right : {
     *     article : string
     *     user    : string
     *     view    : bool
     *     edit    : bool
     * }
     * @param  {object}   req  The request
     * @param  {object}   res  The response
     * @param  {Function} next The next middleware
     */
    controller: function (req, res, next) {
        var app  = req.app;
        var conn = app.locals.conn;
        var log  = app.locals.log;

        if (!req.session.connected) return next(new APIError(401, 'Unauthorized', 'Not connected'));
        if (!req.form.isValid)      return next(new APIError(400, 'Bad Request', req.form.errors));

        can(app)
            .edit(req.session.userData.id, req.form.article)
            .then(function (canEdit) {
                if (!canEdit) return next(new APIError(401, 'Unauthorized', 'No right to edit'));

                req.form.createdAt = new Date();
                req.form.updatedAt = new Date();
                req.form.deletedAt = null;

                log.debug('r.db(wiki).table(rights).insert(' + JSON.stringify(req.form) + ')');
                return r.db('wiki').table('rights')
                    .insert(req.form)
                    .run(conn)
            })
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
