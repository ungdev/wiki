/* Error handler */

'use strict';

var util = require('util');

/**
 * Easiest wrapper around Error
 * @param   {number}  status      The HTTP error code
 * @param   {string}  data        The HTTP error message
 * @param   {object}  additionnal Any additionnal data to be logged
 * @constructor Error
 */
function APIError (status, data, additionnal) {
    this.status      = status;
    this.data        = data;
    this.additionnal = additionnal;
}

util.inherits(APIError, Error);

module.exports = APIError;
