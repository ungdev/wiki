////////////////////////
// Creates an article //
////////////////////////

'use strict';

var form  = require('express-form');
var field = form.field;

module.exports = {
    method: 'post',
    route: '/articles/',
    validation: form(
        field('isDefaultEditable').required().toBooleanStrict(),
        field('isDefaultVisible').required().toBooleanStrict(),
        field('revision').required().is(/^\d+$/),
        field('category_id').required().is(/^\d+$/)
    ),
    /**
     * This controller creates one article
     * 400 error if the article is malformed
     * 500 error if the rethinkdb request fails
     * 200 otherwise
     * Article : {
     *     isDefaultEditable : bool
     *     isDefaultVisible  : bool
     *     revision          : int
     *     category_id       : int
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

        if (!req.form.isValid) return next(new APIError(400, 'Bad Request', req.form.errors));

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
