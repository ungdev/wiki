/* Updates an right */

'use strict';

var form  = require('express-form');
var field = form.field;

module.exports = {
    method: 'put',
    route: '/rights/:uid([0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})',
    validation: form(
        field('user').is(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/),
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
        var app      = req.app;

        var r        = app.locals.r;
        var conn     = app.locals.conn;
        var APIError = app.locals.APIError;
        var log      = app.locals.log;

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
            .catch(function (err) {
                return next(new APIError(500, 'SQL Server Error', err));
            });
    }
};
