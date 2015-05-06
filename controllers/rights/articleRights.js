/* List one article's rights*/

'use strict';

var r     = require('rethinkdb');
var form  = require('express-form');
var field = form.field;

var can      = require('../../lib/can');
var APIError = require('../../lib/APIError');
var uidReg   = require('../../lib/uidReg');

module.exports = {
    method: 'get',
    route: '/articles/:uid(' + uidReg + ')/rights/',
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
        var app  = req.app;
        var conn = app.locals.conn;
        var log  = app.locals.log;

        if (!req.session.connected) {
            return next(new APIError(401, 'Unauthorized', 'Not connected'));
        }

        var uid = req.params.uid;

        if (uid) {
            can(app)
                .edit(req.session.userData.id, uid)
                .then(function (canEdit) {
                    if (!canEdit) return next(new APIError(401, 'Unauthorized', 'No right to edit'));

                    log.debug('r.db(wiki).table(rights).filter(r.row(article).eq(' + uid + '))');
                    r.db('wiki').table('rights')
                        .filter(r.row('article').eq(uid))
                        .filter(r.row('deletedAt').eq(null))
                        .run(conn)
                        .then(function (articleRights) {
                            return articleRights.toArray();
                        })
                        .then(function (articleRights) {
                            return res
                                .status(200)
                                .json(articleRights)
                                .end();
                        })
                        .catch(function (err) {
                            return next(new APIError(500, 'SQL Server Error', err));
                        });
                })
                .catch(function (err) {
                    return next(new APIError(500, 'SQL Server Error', err));
                });
        } else {
            return next(new APIError(400, 'Bad Request', 'Missing uid'));
        }
    }
};
