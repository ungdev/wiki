/* Main entry point */

'use strict';

var r          = require('rethinkdb');
var express    = require('express');
var session    = require('express-session');
var bodyParser = require('body-parser');
var morgan     = require('morgan');
var socketio   = require('socket.io');
var http       = require('http');

var app         = express();
var server      = http.Server(app);
var io          = socketio(server);

var controller  = require('./controllers');
var config      = require('./config.json');
var log         = require('./lib/log')(config);
var APIError    = require('./lib/APIError');
var setupRouter = require('./lib/router');
var setupIO     = require('./lib/socketServer');

log.debug('Welcome to Wiki UTT');

log.debug('Loading controllers');
var controllers;

controller()
    .then(function (controllers_) {
        log.debug('Loaded controllers');
        controllers = controllers_;
    })
    .catch(function (err) {
        log.error(err);
    });

r.connect(config.db)
    .then(function (conn) {
        log.info('Connected to databse');
        app.locals.log    = log;
        app.locals.conn   = conn;
        app.locals.config = config;
    })
    .then(function () {
        setupIO(log, io);

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

        app.use(function (req, res, next) {
            req.session.cookie.maxAge = false;
            next();
        });

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
            if (!(err instanceof APIError)) {
                log.error('Unknown error');
                err = new APIError(500, 'Internal Server Error', err);
            }

            if (err.status !== 404) {
                log.error(err.status + ' on ' + req.originalUrl);
                if (config.log.verbose && err.additionnal) console.log(err.additionnal);
                if (config.log.stack) console.trace();
            } else {
                log.warn('404 on ' + req.originalUrl);
            }

            if (req.xhr) return res.status(err.status).end();

            return res.redirect(config.baseURL + 'error/' + err.status);
        });

        server.listen(config.port, function () {
            log.info('Listening on port %d', config.port);
        });
    });
