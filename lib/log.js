/* Winston log wrapper */

'use strict';

var winston = require('winston');
var logger = new (winston.Logger)({
  levels: {
    'trace':   0,
    'input':   1,
    'verbose': 2,
    'prompt':  3,
    'debug':   4,
    'info':    5,
    'data':    6,
    'help':    7,
    'warn':    8,
    'error':   9
  },
  colors: {
    'trace':   'magenta',
    'input':   'grey',
    'verbose': 'cyan',
    'prompt':  'grey',
    'debug':   'blue',
    'info':    'green',
    'data':    'grey',
    'help':    'cyan',
    'warn':    'yellow',
    'error':   'red'
  }
});

module.exports = function (config) {
    if (config.log.file) {
        logger.add(winston.transports.File, {
            'prettyPrint': false,
            'level':       config.log.level,
            'silent':      false,
            'colorize':    false,
            'timestamp':   true,
            'filename':    config.log.file,
            'maxsize':     40000,
            'maxFiles':    10,
            'json':        false
        });
    }

    if (config.log.console) {
        logger.add(winston.transports.Console, {
            'level':       'trace',
            'prettyPrint': true,
            'colorize':    true,
            'silent':      false,
            'timestamp':   false
        });
    }

    return logger;
};
