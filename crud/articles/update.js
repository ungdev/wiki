////////////
// Update //
////////////

'use strict';

var form  = require('express-form');
var field = form.field;

module.exports = {
    method: 'put',
    route: '/articles/:uid([0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})',
    validation: form(
        field('isDefaultEditable').toBooleanStrict(),
        field('isDefaultVisible').toBooleanStrict(),
        field('revision').is(/^\d+$/),
        field('category_id').is(/^\d+$/)
    ),
    controller: function (req, res, next) {
        var app      = req.app;

        var r        = app.locals.r;
        var conn     = app.locals.conn;
        var config   = app.locals.config;
        var APIError = app.locals.APIError;
        var log      = app.locals.log;

        if (!req.form.isValid) return next(new APIError(400, 'Bad Request', req.form.errors));

        log.debug('r.db(wiki).table(articles).get(' + req.params.uid + ').update(' + JSON.stringify(req.form) + ')');
        r.db('wiki').table('articles')
            .get(req.params.uid)
            .update(req.form)
            .run(conn)
            .then(function (result) {
                res
                    .status(200)
                    .json(result)
                    .end();
            })
            .catch(function (err) {
                next(new APIError(500, 'SQL Server Error', err));
            });
    }
};
