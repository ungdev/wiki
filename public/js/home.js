/* Search among articles */

(function () {
    'use strict';

    var $search = $('#search');
    var $searchTarget = $('#searchResults').hide();

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

            // Add number of articles to category
            $('.collapsible-header').each(function () {
                var $self = $(this);
                $('<span/>')
                    .addClass('badge')
                    .text($self.next().children().children().length)
                    .appendTo($self);
            });
        });

    $search.keyup(function (e) {
        var search = $search.val();
        var $articles = $('li .collection-item').toArray();

        $searchTarget.slideUp(function () {
            $searchTarget.empty();

            $articles
                // Extract article title
                .map(function (e) {
                    return [e.firstChild.nodeValue, $articles.indexOf(e)];
                })
                // Fuzzy match on the article title
                .map(function (data) {
                    var title = data[0];
                    var index = data[1];

                    var result = fuzzy.match(search, title, {
                        pre: '<span class="highlight grey-text text-darken-2">',
                        post: '</span>'
                    });

                    if (result) {
                        result.index = index;
                        return result;
                    }
                })
                // Removes non-matching results
                .filter(function (result) {
                    return result !== undefined;
                })
                // Sort by score
                .sort(function (a, b) {
                    if (a.score > b.score) return 1;
                    if (a.score < b.score) return -1;
                    return 0;
                })
                // Generates HTML
                .forEach(function (result) {
                    $('<a/>')
                        .attr('href', $articles[result.index].href)
                        .addClass('collection-item grey-text text-darken-2')
                        .html(result.rendered)
                        .appendTo($searchTarget);
                });

            if (search.length > 0) {
                if ($searchTarget.children().length > 0) {
                    $search.removeClass('invalid').addClass('valid');
                    $searchTarget.slideDown();
                } else {
                    $search.removeClass('valid').addClass('invalid');
                }
            } else {
                $search.removeClass('invalid').removeClass('valid');
            }
        });
    });
}());
