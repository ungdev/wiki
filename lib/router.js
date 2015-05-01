/* Route controllers */

'use strict';

module.exports = function (app) {
    return function (cruds) {
        cruds.forEach(function (controllers) {
            Object.keys(controllers).forEach(function (controllerName) {
                var controller = controllers[controllerName];

                var method     = controller.method;
                var route      = controller.route;
                var validation = controller.validation;
                var authBefore = controller.auth;
                var handler    = controller.controller;

                var args = [route];

                if (validation) args.push(validation);
                if (authBefore) args.push(authBefore);

                args.push(handler);

                app[method].apply(app, args);
            });
        });
    };
};
