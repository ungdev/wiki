/* Updates an article */

'use strict';

var r     = require('rethinkdb');
var form  = require('express-form');
var field = form.field;

var can      = require('../../lib/can');
var APIError = require('../../lib/APIError');

module.exports = {
    method: 'put',
    route: '/articles/:uid([0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})',
    validation: form(
        field('isDefaultEditable').custom(function (value) {
            if (value === undefined || value === '') {
                return;
            }

            return value === 'true';
        }),
        field('isDefaultVisible').custom(function (value) {
            if (value === undefined || value === '') {
                return;
            }

            return value === 'true';
        }),
        field('content'),
        field('category').is(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/)
    ),
    /**
     * This controller creates one article
     * 400 error if the article is malformed
     * 404 error if the article is not found
     * 500 error if the rethinkdb request fails
     * 200 otherwise
     * Article : {
     *     [isDefaultEditable : bool]
     *     [isDefaultVisible  : bool]
     *     [category          : int]
     * }
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

        can(app)
            .edit(req.session.userData.id, req.params.uid)
            .then(function (canEdit) {
                if (!canEdit) return next(new APIError(401, 'Unauthorized', 'No right to edit'));

                if (!req.form.isValid) return next(new APIError(400, 'Bad Request', req.form.errors));

                req.form.updatedAt = new Date();

                if (!req.form.category) delete req.form.category;
                if (!req.form.content)  delete req.form.content;

                if (req.form.isDefaultVisible === '')  delete req.form.isDefaultVisible;
                if (req.form.isDefaultEditable === '') delete req.form.isDefaultEditable;

                log.debug('r.db(wiki).table(articles).get(' + req.params.uid + ').update(' + JSON.stringify(req.form) + ')');
                r.db('wiki').table('articles')
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
            })
            .catch(function (err) {
                return next(new APIError(500, 'SQL Server Error', err));
            });
    }
};
