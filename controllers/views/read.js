/* Article reading */

'use strict';

module.exports = {
    method: 'get',
    route: '/read/:uid([0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})',
    controller: function (req, res) {
        res.render('read', {
            uid: req.params.uid
        });
    }
};
