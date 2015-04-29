/* Error throwing */

'use strict';

module.exports = {
    method: 'get',
    route: '/error/:status(\\d{3})',
    controller: function (req, res) {
        res.render('error', {
            status: req.params.status
        });
    }
};
