/* Error handler */

'use strict';

var util = require('util');

function APIError (status, data, additionnal) {
    this.status      = status;
    this.data        = data;
    this.additionnal = additionnal;
}

util.inherits(APIError, Error);

module.exports = APIError;
