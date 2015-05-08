/* Error throwing */

'use strict';

module.exports = {
    method: 'get',
    route: '/error/:status(\\d{3})',
    /**
     * This controller shows the server or the user error page
     * @param  {object} req  The request
     * @param  {object} res  The response
     */
    controller: function (req, res) {
        return res.render('error', {
            status: req.params.status
        });
    }
};
