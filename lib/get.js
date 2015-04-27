/* Gets request */

'use strict';

var Promise = require('bluebird');
var request = require('request');

/**
 * This function will make a GET request.
 * @param   {string}  url The URL to make the POST
 * @returns {Promise}     A Promise
 */
module.exports = function (url) {
    return new Promise(function (resolve, reject) {
        request(url, function (err, response, body) {
            var data = JSON.parse(body);
            if (!err && data.http.status === 200) {
                resolve(data);
            } else {
                reject([err, data]);
            }
        });
    });
};
