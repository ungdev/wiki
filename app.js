/* Main entry point */

'use strict';

var express    = require('express');
var session    = require('express-session');
var bodyParser = require('body-parser');
var r          = require('rethinkdb');
var morgan     = require('morgan');

var app         = express();
var controller  = require('./controllers');
var config      = require('./config.json');
var log         = require('./lib/log')(config);
var APIError    = require('./lib/APIError');
var setupRouter = require('./lib/router');

log.debug('Welcome to Wiki UTT');

var controllers;

controller()
    .then(function (controllers_) {
        controllers = controllers_;
    })
    .catch(function (err) {
        log.error(err);
    });

r.connect(config.db)
    .then(function (conn) {
        log.info('Connected to databse');
        app.locals.log      = log;
        app.locals.conn     = conn;
        app.locals.r        = r;
        app.locals.config   = config;
        app.locals.APIError = APIError;
    })
    .then(function () {
        // Request logger
        app.use(morgan(':method :url :status :response-time ms', {
            stream: {
                write: function (message) {
                    log.info(message.trim());
                }
            }
        }));

        // Session
        app.use(session({
            secret: config.secret,
            resave: false,
            saveUninitialized: false,
            cookie: { maxAge: 60 * 60000 }
        }));

        // EJS
        app.set('views', __dirname + '/public/views');
        app.set('view engine', 'ejs');

        // Body parsing
        app.use(bodyParser.json());

        // Static serving
        app.use(express.static(__dirname + '/public'));

        // Base CRUD
        setupRouter(app)(controllers);

        // 404 handling
        app.use(function (req, res, next) {
            return next(new APIError(404, 'Not Found'));
        });

        // Error handling
        // Keep the four arguments even if next is unused. The number of arguments is checked
        app.use(function (err, req, res, next) {
            if (err.status !== 404) {
                log.error(err.status + ' on ' + req.originalUrl);
                if (config.log.verbose && err.additionnal) console.log(err.additionnal);
                if (config.log.stack) console.trace(err.stack);
            } else {
                log.warn('404 on ' + req.originalUrl);
            }

            if (req.xhr) return res.status(err.status).end();

            //return res.redirect(config.baseURL + '/error.html#' + err.status);
            return res
                .status(err.status)
                .end();
        });

        app.listen(config.port);
        log.info('Listening on port %d', config.port);
    });
