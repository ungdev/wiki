/* Gets the url to login on etu site */

'use strict';

module.exports = {
    method: 'get',
    route: '/login/getURL',
    /**
     * This controller generates the url to login on etu site
     * @param  {object}   req  The request
     * @param  {object}   res  The response
     */
    controller: function (req, res) {
        var app = req.app;

        var config = app.locals.config;

        return res
            .status(200)
            .json({
                url: config.etu.baseURL +
                'oauth/authorize?client_id=' + config.etu.id +
                '&scopes=public%20private_user_account%20private_user_organizations' +
                '&response_type=code' +
                '&state=login'
            });
    }
};
