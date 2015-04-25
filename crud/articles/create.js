////////////
// Create //
////////////

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
    controller: function (req, res, next) {
        var app      = req.app;

        var r        = app.locals.r;
        var conn     = app.locals.conn;
        var config   = app.locals.config;
        var APIError = app.locals.APIError;
        var log      = app.locals.log;

        if (!req.form.isValid) return next(new APIError(400, 'Bad Request', req.form.errors));

        log.debug('r.db(wiki).table(articles).insert(' + JSON.stringify(req.form) + ')');
        r.db('wiki').table('articles')
            .insert(req.form)
            .run(conn)
            .then(function (result) {
                res
                    .status(200)
                    .json(result.generated_keys)
                    .end();
            })
            .catch(function (err) {
                next(new APIError(500, 'SQL Server Error', err));
            });
    }
};
