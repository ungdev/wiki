/* Homepage and login */

'use strict';

module.exports = {
    method: 'get',
    route: '/',
    /**
     * This controller generates the login html and the home html
     * @param  {object}   req  The request
     * @param  {object}   res  The response
     */
    controller: function (req, res) {
        var app = req.app;

        if (req.session.connected) {
            var r        = app.locals.r;
            var conn     = app.locals.conn;
            var APIError = app.locals.APIError;
            var log      = app.locals.log;

            log.debug('r.db(wiki).table(categories).filter(r.row(deletedAt).eq(null).toArray()');
            r.db('wiki').table('categories')
                .filter(r.row('deletedAt').eq(null))
                .run(conn)
                .then(function (categories) {
                    return categories.toArray();
                })
                .then(function (categories) {
                    res.render('index', {
                        title: 'Accueil',
                        connected: true,
                        categories: categories
                    });
                })
                .catch(function (err) {
                    return next(new APIError(500, 'SQL Server Error', err));
                });
        } else {
            res.render('index', {
                title: 'Connexion',
                connected: false
            });
        }
    }
};
