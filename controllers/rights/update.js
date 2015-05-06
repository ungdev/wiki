/* Updates an right */

'use strict';

var r     = require('rethinkdb');
var form  = require('express-form');
var field = form.field;

var can      = require('../../lib/can');
var APIError = require('../../lib/APIError');
var uidReg   = require('../../lib/uidReg');

module.exports = {
    method: 'put',
    route: '/rights/:uid(' + uidReg + ')',
    validation: form(
        field('user').is(new RegExp('/^' + uidReg + '$/')),
        field('view').toBooleanStrict(),
        field('edit').toBooleanStrict()
    ),
    /**
     * This controller creates one right
     * 400 error if the right is malformed
     * 404 error if the right is not found
     * 500 error if the rethinkdb request fails
     * 200 otherwise
     * Right : {
     *     [user  : string]
     *     [view  : bool]
     *     [edit  : bool]
     * }
     * @param  {object}   req  The request
     * @param  {object}   res  The response
     * @param  {Function} next The next middleware
     */
    controller: function (req, res, next) {
        var app  = req.app;
        var conn = app.locals.conn;
        var log  = app.locals.log;

        if (!req.session.connected) return next(new APIError(401, 'Unauthorized', 'Not connected'));

        can(app)
            .editRight(req.session.userData.id, req.params.uid)
            .then(function (canEdit) {
                if (!canEdit) return next(new APIError(401, 'Unauthorized', 'No right to edit'));

                if (!req.form.isValid) return next(new APIError(400, 'Bad Request', req.form.errors));

                req.form.updatedAt = new Date();

                if (!req.form.user) delete req.form.user;

                log.debug('r.db(wiki).table(rights).get(' + req.params.uid + ').update(' + JSON.stringify(req.form) + ')');
                r.db('wiki').table('rights')
                    .get(req.params.uid)
                    .update(req.form)
                    .run(conn)
                    .then(function (result) {
                        if (result.skipped === 1) {
                            return next(new APIError(404, 'Not Found', result));
                        }
                        return res
                            .status(200)
                            .json(result)
                            .end();
                    })
                    .catch(function (err) {
                        return next(new APIError(500, 'SQL Server Error', err));
                    });
            })
            .catch(function (err) {
                return next(new APIError(500, 'SQL Server Error', err));
            });
    }
};
