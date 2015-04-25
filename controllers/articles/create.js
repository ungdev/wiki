/* Creates an article */

'use strict';

var form  = require('express-form');
var field = form.field;

module.exports = {
    method: 'post',
    route: '/articles/',
    validation: form(
        field('isDefaultEditable').required().toBooleanStrict(),
        field('isDefaultVisible').required().toBooleanStrict(),
        field('category').required().is(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/)
    ),
    /**
     * This controller creates one article
     * 400 error if the article is malformed
     * 500 error if the rethinkdb request fails
     * 200 otherwise
     * Article : {
     *     isDefaultEditable : bool
     *     isDefaultVisible  : bool
     *     content           : string
     *     category          : string
     * }
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

        if (!req.form.isValid) {
            next(new APIError(400, 'Bad Request', req.form.errors));
            return;
        }

        req.form.createdAt = new Date();
        req.form.updatedAt = new Date();
        req.form.deletedAt = null;

        log.debug('r.db(wiki).table(articles).insert(' + JSON.stringify(req.form) + ')');
        r.db('wiki').table('articles')
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