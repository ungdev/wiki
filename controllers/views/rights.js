/* Article rights edition */

'use strict';

module.exports = {
    method: 'get',
    route: '/editRights/:uid([0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})',
    /**
     * This controller lists the rights of one article and allows the user to edit thoses rights
     * @param  {object}   req The request
     * @param  {object}   res The response
     * @param  {Function} next The next middleware
     */
    controller: function (req, res, next) {
        var app = req.app;

        var APIError = app.locals.APIError;

        if (!req.session.connected) {
            return next(new APIError(401, 'Unauthorized'));
        }

        return res.render('rights', {
            uid: req.params.uid
        });
    }
};
