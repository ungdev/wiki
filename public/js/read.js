/* Read an article */

(function () {
    'use strict';

    var $articleTitle = $('#articleTitle');
    var $title        = $('title');
    var $target       = $('.target');
    var article;

    $.get('/articles/' + location.pathname.split('/')[2])
        .done(function (res) {
            article = res;

            $title.append(' - ' + article.title);
            $articleTitle.text(article.title);
            var html = marked(article.content, {
                breaks: true,
                sanitize: true,
                highlight: function (code) {
                    return hljs.highlightAuto(code).value;
                }
            });
            $target.html(html);

            // Fix https://github.com/chjj/marked/issues/255
            $('pre code').addClass('hljs');
        })
        .fail(function (res) {
            location.href = '/error.html#' + res.status;
        });

}());
