/* Categories management */

'use strict';

var can      = require('../../lib/can');
var APIError = require('../../lib/APIError');

module.exports = {
    method: 'get',
    route: '/admin/',
    /**
     * This controller shows the categories management page
     * @param  {object}   req  The request
     * @param  {object}   res  The response
     * @param  {Function} next The next middleware
     */
    controller: function (req, res, next) {
        if (!req.session.connected)         return next(new APIError(401, 'Unauthorized', 'Not connected'));
        if (!req.session.canEditCategories) return next(new APIError(401, 'Unauthorized', 'Not desk member'));

        return res.render('categories');
    }
};
