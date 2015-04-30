/* Can a user edit or view this article */

var r       = require('rethinkdb');
var Promise = require('bluebird');

/**
 * This module performs the check to know if a user can view/edit an article
 * @param   {object}                           app The base application
 * @returns {{view: Function, edit: Function}}     view and edit helpers. Must be called with (user, article)
 */
module.exports = function (app) {
    var log      = app.locals.log;
    var conn     = app.locals.conn;

    /**
     * Makes the helper
     * @param   {string}  isDefaultWhat The default property name (isDefaultVisible or isDefaultEditable) in Articles table
     * @param   {string}  rightProperty The right property name (view or edit) in Rights table
     * @param   {string}  user          The user id
     * @param   {string}  article       The article id
     * @returns {Promise}               A promise that will resolve true/false
     */
    function makeCan (isDefaultWhat, rightProperty, user, article) {
        return new Promise(function (resolve, reject) {
            log.debug('r.db(wiki).table(articles).get(' + article + ')(' + isDefaultWhat + ')');
            r.db('wiki').table('articles')
                .get(article)(isDefaultWhat)
                .run(conn)
                .then(function (canDefault) {
                    var can = canDefault;

                    var filter = {
                        user: user,
                        article: article
                    };
                    // Search for the opposite right
                    filter[rightProperty] = !can;

                    log.debug('r.db(wiki).table(articles).filter(' + JSON.stringify(filter) + ').count()');
                    r.db('wiki').table('rights')
                        .filter(filter)
                        .count()
                        .run(conn)
                        .then(function (count) {
                            // count > 0 => something gainsay the default right
                            if (count === 0) {
                                resolve(can);
                            } else {
                                resolve(!can)
                            }
                        })
                        .catch(function (err) {
                            reject(err);
                        });
                })
                .catch(function (err) {
                    reject(err);
                });
        });
    }

    return {
        view: function (user, article) {
            return makeCan('isDefaultVisible', 'view', user, article);
        },
        edit: function (user, article) {
            return makeCan('isDefaultEditable', 'edit', user, article);
        }
    };
};
