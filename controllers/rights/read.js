/* List rights, or get one's details */

'use strict';

var r     = require('rethinkdb');
var form  = require('express-form');
var field = form.field;

var can      = require('../../lib/can');
var APIError = require('../../lib/APIError');
var uidReg   = require('../../lib/uidReg');

module.exports = {
    method: 'get',
    route: [
        '/rights/:uid(' + uidReg + ')',
        '/rights/'
    ],
    /**
     * This controller lists all rights, or just one
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

        if (!req.session.connected) {
            return next(new APIError(401, 'Unauthorized', 'Not connected'));
        }

        var uid = req.params.uid;

        if (uid) {
            can(app)
                .editRight(req.session.userData.id, uid)
                .then(function (canView) {
                    if (!canView) return next(new APIError(401, 'Unauthorized', 'No right to view'));

                    log.debug('r.db(wiki).table(rights).get(' + uid + ')');
                    r.db('wiki').table('rights')
                        .get(uid)
                        .run(conn)
                        .then(function (right) {
                            if (!right || right.deletedAt !== null) {
                                return next(new APIError(404, 'Not Found'));
                            }

                            return res
                                .status(200)
                                .json(right)
                                .end();
                        })
                        .catch(function (err) {
                            return next(new APIError(500, 'SQL Server Error', err));
                        });
                })
                .catch(function (err) {
                    return next(new APIError(500, 'SQL Server Error', err));
                });
        } else {
            log.debug('r.db(wiki).table(rights).filter(r.row(deletedAt).eq(null).toArray()');
            r.db('wiki').table('rights')
                .filter(r.row('deletedAt').eq(null))
                .run(conn)
                .then(function (rights) {
                    return rights.toArray();
                })
                .then(function (rights) {
                    var rightsAllowed = [];

                    rights.forEach(function (right, i) {
                        can(app)
                            .editRight(req.session.userData.id, right.id)
                            .then(function (canView) {
                                if (canView) rightsAllowed.push(right);

                                if (i === rights.length - 1) {
                                    return res
                                        .status(200)
                                        .json(rightsAllowed)
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
