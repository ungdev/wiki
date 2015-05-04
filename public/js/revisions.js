/* Edit the rights of an article */

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
                    var date      = new Date(revision.createdAt);
                    var formatted = pad2(date.getDate()) + '/' +
                        pad2(date.getMonth()) + '/' +
                        pad2(date.getFullYear()) + ' - ' +
                        pad2(date.getHours()) + ':' +
                        pad2(date.getMinutes());

                    var whoDid = (revision.length >= i + 1) ? revision[i + 1].overridenBy : article.lastAuthorName;

                    if (i === 0) {
                        date      = new Date(article.updatedAt);
                        formatted = pad2(date.getDate()) + '/' +
                            pad2(date.getMonth()) + '/' +
                            pad2(date.getFullYear()) + ' - ' +
                            pad2(date.getHours()) + ':' +
                            pad2(date.getMinutes());
                        $target.append('<a href="#" class="collection-item blue-text" data-index="' + (revisions.length - i) + '">Dernier article du ' + formatted + ' par ' + whoDid + '</a>');
                    } else {
                        $target.append('<a href="#" class="collection-item blue-text" data-index="' + (revisions.length - i) + '">Révision du ' + formatted + ' par ' + whoDid + '</a>');
                    }
                });

                var date      = new Date(article.createdAt);
                var formatted = pad2(date.getDate()) + '/' +
                    pad2(date.getMonth()) + '/' +
                    pad2(date.getFullYear()) + ' - ' +
                    pad2(date.getHours()) + ':' +
                    pad2(date.getMinutes());

                $target.append('<a href="#" class="collection-item initialVersion blue-text" data-index="0">Création par ' + article.authorName + ' (' + formatted + ')</a>');

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
                                    console.log('RESTORE');
                                    console.log(content);

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

    var pad2 = function (n) { return n < 10 ? '0' + n : '' + n };

    // Enable zen tooltip and modals
    $('.tooltipped').tooltip();
    $('.modal-trigger').leanModal();
}());
