/* Error throwing */

'use strict';

module.exports = {
    method: 'get',
    route: '/error/:status(\\d{3})',
    /**
     * This controller renders the server or the user error
     * @param  {object} req  The request
     * @param  {object} res  The response
     */
    controller: function (req, res) {
        res.render('error', {
            status: req.params.status
        });
    }
};
