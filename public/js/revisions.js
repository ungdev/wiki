/* Revisions tool */

(function () {
    'use strict';

    var uid                = location.pathname.split('/')[2];
    var $articleTitle      = $('#articleTitle');
    var $title             = $('title');
    var $target            = $('.target');
    var $preview           = $('.preview');

    var article;
    var revisions;

    // Retrieve the article
    $
        .get('/articles/' + uid)
        .done(function (res) {
            article = res;

            $title.append(' - ' + res.title + ' - Droits');
            $articleTitle.html('<a href="/read/' + res.id + '">' + res.title + '</a> - Historique');

            retrieveHistory();
        })
        .fail(function (res) {
            location.href = '/error/' + res.status;
        });

    // Retrieve histories
    function retrieveHistory () {
        $
            .get('/revisions/' + uid)
            .done(function (res) {
                revisions = res.sort(function (a, b) {
                    return new Date(a.createdAt) > new Date(b.createdAt);
                });

                revisions.forEach(function (revision, i) {
                    var date = $.formatDate(revision.createdAt, true);
                    var whoDid    = (revision.length >= i + 1) ? revision[i + 1].overridenBy : article.lastAuthorName;

                    if (i === 0) {
                        date = $.formatDate(article.updatedAt, true);
                        $target.append('<a href="#" class="collection-item blue-text" data-index="' + (revisions.length - i) + '">Dernier article du ' + date + ' par ' + whoDid + '</a>');
                    } else {
                        $target.append('<a href="#" class="collection-item blue-text" data-index="' + (revisions.length - i) + '">Révision du ' + date + ' par ' + whoDid + '</a>');
                    }
                });

                var date = $.formatDate(article.createdAt, true);

                $target.append('<a href="#" class="collection-item initialVersion blue-text" data-index="0">Création par ' + article.authorName + ' (' + date + ')</a>');

                revisions.push({
                    content: article.content
                });

                $('.collection-item')
                    .mouseenter(function () {
                        var i       = $(this).data('index');
                        var content = revisions[i].content;

                        var html = marked(content, {
                            breaks: true,
                            sanitize: true,
                            highlight: function (code) {
                                return hljs.highlightAuto(code).value;
                            }
                        });
                        $preview.html(html);

                        if (i !== revisions.length - 1) {
                            // Select this one
                            var $selecter = $('<a href="#" class="btn waves-effect waves-light blue" id="restore">Restorer cette version</a>')
                                .click(function (e) {
                                    e.preventDefault();

                                    $selecter.addClass('disabled').attr('disabled', '');
                                    $
                                        .ajax({
                                            url: '/articles/' + uid,
                                            type: 'put',
                                            contentType: 'application/json; charset=utf-8',
                                            data: JSON.stringify({ content: content })
                                        })
                                        .done(function () {
                                            location.href = '/read/' + uid;
                                        })
                                        .fail(function (res) {
                                            location.href = '/error/' + res.status;
                                        });
                                });
                            $preview.append($selecter);
                        }

                        // Fix https://github.com/chjj/marked/issues/255
                        $('pre code').addClass('hljs');

                        // KateX
                        renderMathInElement($preview[0]);
                    })
                    .click(function (e) {
                        e.preventDefault();
                    });
            })
            .fail(function (res) {
                location.href = '/error/' + res.status;
            });
    }

    // Enable zen tooltip and modals
    $('.tooltipped').tooltip();
    $('.modal-trigger').leanModal();
}());
