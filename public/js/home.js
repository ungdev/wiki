/* Search among articles */

(function () {
    'use strict';

    var $search = $('#search');

    // Get all the articles
    $.get('/articles/')
        .done(function (res) {
            res.forEach(function (article) {
                var $target = $('#' + article.category + ' > .collapsible-body > .collection');

                var date = new Date(article.updatedAt);

                var pad2 = function (n) { return n < 10 ? '0' + n : '' + n };

                var formatted = pad2(date.getDate()) + '/' +
                                pad2(date.getMonth()) + '/' +
                                pad2(date.getFullYear());

                var $a = $('<a/>')
                    .addClass('collection-item')
                    .attr('href', '/read/' + article.id)
                    .text(article.title);

                $('<span/>')
                    .addClass('badge')
                    .text(formatted)
                    .appendTo($a);

                $a.appendTo($target);
            });
        });

    $search.keyup(function (e) {
        var search = $search.val();
    });
}());
