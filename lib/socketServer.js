/* Live changes socket server */

/**
 * Setup the Socket.io server to exchange the live changes
 * @param  {object}  log           The logger
 * @param  {object} io  The Socket.io instance
 */
module.exports = function (log, io) {
    io.on('connection', function (socket) {
        socket.on('join', function (uid) {
            log.info(socket.id + ' wants to join ' + uid);
            socket.join(uid, function () {
                socket.broadcast.to(socket.rooms[1]).emit('getLastVersion');
            });
        });

        socket.on('answerLastVersion', function (lastVersion) {
            setTimeout(function () {
                socket.broadcast.to(socket.rooms[1]).emit('answerLastVersion', lastVersion);
            }, 1000);
        });

        socket.on('remove', function (start, len) {
            socket.broadcast.to(socket.rooms[1]).emit('remove', start, len);
        });

        socket.on('insert', function (start, text) {
            socket.broadcast.to(socket.rooms[1]).emit('insert', start, text);
        });

        log.debug('New user');
    });
};
