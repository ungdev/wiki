/* Edit the rights of an article */

(function () {
    'use strict';

    var uid                = location.pathname.split('/')[2];
    var $articleTitle      = $('#articleTitle');
    var $title             = $('title');
    var $target            = $('.target');

    var article;
    var revisions;

    // Retrieve the article
    $
        .get('/articles/' + uid)
        .done(function (res) {
            article = res;

            $title.append(' - ' + res.title + ' - Droits');
            $articleTitle.html('<a href="/read/' + res.id + '">' + res.title + '</a> - Historique');
        })
        .fail(function (res) {
            location.href = '/error/' + res.status;
        });

    // Retrieve histories
    $
        .get('/revisions/' + uid)
        .done(function (res) {
            revisions = res;
            res.forEach(function (revision, i) {
                var pad2 = function (n) { return n < 10 ? '0' + n : '' + n };

                var date = new Date(revision.createdAt);
                var formatted = pad2(date.getDate()) + '/' +
                    pad2(date.getMonth()) + '/' +
                    pad2(date.getFullYear());

                var whoDid = (revision.length >= i + 1) ? revision[i + 1].overridenBy : article.authorName;

                $target.append('<a href="#" class="collection-item" data-index="' + i + '">Révision du ' + formatted + ' par ' + whoDid + '</a>');
            });
        })
        .fail(function (res) {
            location.href = '/error/' + res.status;
        });

    // Enable zen tooltip and modals
    $('.tooltipped').tooltip();
    $('.modal-trigger').leanModal();
}());
