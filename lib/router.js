///////////////////////
// Route controllers //
///////////////////////

'use strict';

module.exports = function (app) {
    return function (cruds) {
        cruds.forEach(function (controllers) {
            Object.keys(controllers).forEach(function (controllerName) {
                var controller = controllers[controllerName];

                var method     = controller.method;
                var route      = controller.route;
                var validation = controller.validation;
                var handler    = controller.controller;
                var args = [];

                if (validation) app[method](route, validation, handler);
                else            app[method](route,             handler);
            });
        });
    };
};
