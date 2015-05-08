/* Homepage and login */

'use strict';

var r = require('rethinkdb');

module.exports = {
    method: 'get',
    route: '/',
    /**
     * This controller shows the login page or the home page wether the user is connected or not
     * @param  {object} req The request
     * @param  {object} res The response
     */
    controller: function (req, res) {
        var app = req.app;

        if (req.session.connected) {
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
                    return res.render('index', {
                        title: 'Accueil',
                        connected: true,
                        categories: categories
                    });
                })
                .catch(function (err) {
                    return next(new APIError(500, 'SQL Server Error', err));
                });
        } else {
            return res.render('index', {
                title: 'Connexion',
                connected: false
            });
        }
    }
};
