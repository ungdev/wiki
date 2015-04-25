////////////////////
// CRUD base file //
////////////////////

'use strict';

var Promise = require('bluebird');
var fs      = Promise.promisifyAll(require("fs"));
var path    = require('path');

module.exports = function () {
    return new Promise(function (resolve, reject) {
        fs
            .readdirAsync(__dirname)
            .then(function (files) {
                return files
                        .filter(function (file) {
                            return (file !== path.basename(__filename));
                        })
                        .map(function (file) {
                            return require(__dirname + '/' + file);
                        });
            })
            .then(function (cruds) {
                resolve(cruds);
            })
            .catch(function (err) {
                reject(err);
            });
    });
};
