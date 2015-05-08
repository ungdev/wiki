/* Article reading */

'use strict';

var can      = require('../../lib/can');
var APIError = require('../../lib/APIError');

module.exports = {
    method: 'get',
    route: '/read/:uid([0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})',
    /**
     * This controller shows the article page
     * @param  {object}   req  The request
     * @param  {object}   res  The response
     * @param  {Function} next The next middleware
     */
    controller: function (req, res, next) {
        var app = req.app;

        if (!req.session.connected) return next(new APIError(401, 'Unauthorized', 'Not connected'));

        can(app)
            .view(req.session.userData.id, req.params.uid)
            .then(function (canRead) {
                if (!canRead) return next(new APIError(401, 'Unauthorized', 'No right to read'));

                return res.render('read', {
                    uid: req.params.uid
                });
            })
            .catch(function (err) {
                return next(new APIError(500, 'SQL Server Error', err));
            });
    }
};
