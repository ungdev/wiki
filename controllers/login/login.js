/* Logs in from etu site */

'use strict';

var post  = require('../../lib/post');
var get_  = require('../../lib/get');
var APIError = require('../../lib/APIError');

module.exports = {
    method: 'get',
    route: '/login/logged',
    /**
     * This controller logs the user on the etu site
     * 400 error if no code is specified
     * @param  {object}   req  The request
     * @param  {object}   res  The response
     * @param  {Function} next The next middleware
     */
    controller: function (req, res, next) {
        var app = req.app;

        var config = app.locals.config;

        if (!req.query.authorization_code || req.query.authorization_code.length === 0) return next(new APIError(400, 'Bad Request'));

        var form = {
            grant_type: 'authorization_code',
            authorization_code: req.query.authorization_code
        };

        var auth = {
            username: config.etu.id,
            pass: config.etu.secret
        };

        post(config.etu.baseURL + 'oauth/token', form, auth)
            .then(function (data) {
                req.session.accessToken  = data.response.access_token;

                return get_(config.etu.baseURL + 'private/user/account?access_token=' + req.session.accessToken);
            })
            .then(function (data) {
                req.session.userData = {
                    id: data.response.data.login,
                    firstName: data.response.data.firstName,
                    lastName: data.response.data.lastName
                };

                req.session.connected = true;

                return get_(config.etu.baseURL + 'private/user/organizations?access_token=' + req.session.accessToken);
            })
            .then(function (data) {
                var orgs = data.response.data;

                var getNames = orgs.map(function (org) {
                    var orgName = org._embed.organization;

                    if (org.role !== 'member' && orgName === config.organization) {
                        req.session.canEditCategories = true;
                    }

                    return get_(config.etu.baseURL + 'public/orgas/' + orgName + '?access_token=' + req.session.accessToken);
                });

                return Promise.all(getNames);
            })
            .then(function (orgsData) {
                req.session.userOrganizations = orgsData.map(function (orgData) {
                    return [orgData.response.data.login, orgData.response.data.name];
                });

                return res
                    .redirect('/');
            })
            .catch(function (err_) {
                var err = err_[0];
                var data = err_[1];
                if (err && data) {
                    return next(new APIError(data.http.status, data.http.message, err));
                } else {
                    return next(new APIError(500, 'Internal Server Error', err_));
                }
            });
    }
};
