/* Can a user edit or view this article, or edit this right */

var r       = require('rethinkdb');
var Promise = require('bluebird');

/**
 * Makes the helper
 * @param   {object}  conn          The rethinkdb connection
 * @param   {object}  log           The logger
 * @param   {string}  isDefaultWhat The default property name (isDefaultVisible or isDefaultEditable) in Articles table
 * @param   {string}  rightProperty The right property name (view or edit) in Rights table
 * @param   {string}  user          The user id
 * @param   {string}  article       The article id
 * @returns {Promise}               A promise that will resolve true/false
 */
function makeCan (conn, log, isDefaultWhat, rightProperty, user, article) {
    return new Promise(function (resolve, reject) {
        log.debug('r.db(wiki).table(articles).get(' + article + ')');
        r.db('wiki').table('articles')
            .get(article)
            .run(conn)
            .then(function (article) {
                var canDefault = article[isDefaultWhat];

                if (article.deletedAt !== null) return resolve(false);

                var can = canDefault;

                var filter = {
                    user: user,
                    article: article.id
                };
                // Search for the opposite right
                filter[rightProperty] = !can;

                log.debug('r.db(wiki).table(rights).filter(' + JSON.stringify(filter) + ').count()');
                r.db('wiki').table('rights')
                    .filter(filter)
                    .count()
                    .run(conn)
                    .then(function (count) {
                        // count > 0 => something gainsay the default right
                        if (count === 0) return resolve(can);
                        return resolve(!can);
                    })
                    .catch(function (err) {
                        return reject(err);
                    });
            })
            .catch(function (err) {
                return reject(err);
            });
    });
}

module.exports = function (app) {
    var log  = app.locals.log;
    var conn = app.locals.conn;

    return {
        view: function (user, article) {
            return makeCan(conn, log, 'isDefaultVisible', 'view', user, article);
        },
        edit: function (user, article) {
            return makeCan(conn, log, 'isDefaultEditable', 'edit', user, article);
        },
        editRight: function (user, right) {
            return new Promise(function (resolve, reject) {
                log.debug('r.db(wiki).table(rights).get(' + right + ')(article)');
                r.db('wiki').table('rights')
                    .get(right)
                    .run(conn)
                    .then(function (right) {
                        if (right.frozen) {
                            return false;
                        }
                        return makeCan(conn, log, 'isDefaultEditable', 'edit', user, right.article);
                    })
                    .then(function (canDo) {
                        resolve(canDo);
                    })
                    .catch(function (err) {
                        return reject(err);
                    });
            });
        }
    };
};
