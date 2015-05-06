/* List revisions, or get one's details */

'use strict';

var r     = require('rethinkdb');
var form  = require('express-form');
var field = form.field;

var can      = require('../../lib/can');
var APIError = require('../../lib/APIError');

module.exports = {
    method: 'get',
    route: [
        '/revisions/:uid([0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})',
        '/revisions/'
    ],
    /**
     * This controller lists all revisions, or just one
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
                .then(function (canView) {
                    if (!canView) return next(new APIError(401, 'Unauthorized', 'No right to view'));

                    log.debug('r.db(wiki).table(revisions).filter({article: ' + uid + '}).filter(r.row(deletedAt).ne(null))');
                    r.db('wiki').table('revisions')
                        .filter({
                            article: uid
                        })
                        .filter(r.row('deletedAt').ne(null))
                        .run(conn)
                        .then(function (revisions) {
                            return revisions.toArray();
                        })
                        .then(function (revisions) {
                            return res
                                .status(200)
                                .json(revisions)
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
