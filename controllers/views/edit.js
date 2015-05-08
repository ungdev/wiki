/* Article editing */

'use strict';

var can      = require('../../lib/can');
var APIError = require('../../lib/APIError');

module.exports = {
    method: 'get',
    route: '/edit/:uid([0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})',
    /**
     * This controller shows the article edition page
     * @param  {object}   req  The request
     * @param  {object}   res  The response
     * @param  {Function} next The next middleware
     */
    controller: function (req, res, next) {
        var app = req.app;

        if (!req.session.connected) return next(new APIError(401, 'Unauthorized', 'Not connected'));

        can(app)
            .edit(req.session.userData.id, req.params.uid)
            .then(function (canEdit) {
                if (!canEdit) return next(new APIError(401, 'Unauthorized', 'No right to edit'));

                return res.render('edit', {
                    uid: req.params.uid
                });
            })
            .catch(function (err) {
                return next(new APIError(500, 'SQL Server Error', err));
            });
    }
};
