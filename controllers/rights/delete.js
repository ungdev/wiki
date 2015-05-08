/* Deletes a right */

'use strict';

var r     = require('rethinkdb');
var form  = require('express-form');
var field = form.field;

var can      = require('../../lib/can');
var APIError = require('../../lib/APIError');
var uidReg   = require('../../lib/uidReg');

module.exports = {
    method: 'delete',
    route: '/rights/:uid(' + uidReg + ')',
    /**
     * This controller deletes one right
     * 404 error if the right is not found
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

        if (!req.session.connected) return next(new APIError(401, 'Unauthorized', 'Not connected'));

        can(app)
            .editRight(req.session.userData.id, req.params.uid)
            .then(function (canEdit) {
                if (!canEdit) return next(new APIError(401, 'Unauthorized', 'No right to edit'));

                var deleter = { deletedAt: new Date() };

                log.debug('r.db(wiki).table(rights).get(' + req.params.uid + ').update(' + JSON.stringify(deleter) + ')');
                return r.db('wiki').table('rights')
                    .get(req.params.uid)
                    .update(deleter)
                    .run(conn)
            })
            .then(function (result) {
                if (result.skipped === 1) return next(new APIError(404, 'Not Found', result));

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
