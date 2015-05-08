/* Posts form */

'use strict';

var Promise = require('bluebird');
var request = require('request');

/**
 * This function will make a POST request, simulating a <form> request.
 * Can use Basic auth
 * @param   {string}  url    The URL to make the POST
 * @param   {object}  form   The post data
 * @param   {object}  [auth] username and pass for a Basic HTTP Auth
 * @returns {Promise}        A Promise
 */
module.exports = function (url, form, auth) {
    return new Promise(function (resolve, reject) {
        request
            .post('https://etu.utt.fr/api/' + 'oauth/token', {
                form: form,
                auth: auth,
                headers: {
                    'Content-Length': (require('querystring').stringify(form).length)
                }
            }, function (err, response, body) {
                var data = JSON.parse(body);
                if (!err && data.http.status === 200) resolve(data);
                else reject([err, data]);
            });
    });
};
