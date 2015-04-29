/* Deletes a right */

'use strict';

var form  = require('express-form');
var field = form.field;

module.exports = {
    method: 'delete',
    route: '/rights/:uid([0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})',
    /**
     * This controller deletes one right
     * 400 error if the right is malformed
     * 404 error if the right is not found
     * 500 error if the rethinkdb request fails
     * 200 otherwise
     * @param  {object}   req  The request
     * @param  {object}   res  The response
     * @param  {Function} next The next middleware
     */
    controller: function (req, res, next) {
        var app      = req.app;

        var r        = app.locals.r;
        var conn     = app.locals.conn;
        var APIError = app.locals.APIError;
        var log      = app.locals.log;

        var deleter = { deletedAt: new Date() };

        log.debug('r.db(wiki).table(rights).get(' + req.params.uid + ').update(' + JSON.stringify(deleter) + ')');
        r.db('wiki').table('rights')
            .get(req.params.uid)
            .update(deleter)
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
            .catch(function (err) {
                return next(new APIError(500, 'SQL Server Error', err));
            });
    }
};