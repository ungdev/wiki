/* Search among articles */

(function () {
    'use strict';

    var $search       = $('#search');
    var $searchTarget = $('#searchResults').hide();
    var $title        = $('#title');
    var $category     = $('#category');
    var $isDefaultVi  = $('#isDefaultVisible');
    var $isDefaultEd  = $('#isDefaultEditable');
    var $submitCreate = $('.modal-footer > button');
    var prevValue     = '';
    var titleReg      = /^[\S ]{4,}$/i;

    // Get all the articles
    $.get('/articles/')
        .done(function (res) {
            res.forEach(function (article) {
                var $target = $('#' + article.category + ' > .collapsible-body > .collection');

                var $a = $('<a/>')
                    .addClass('collection-item')
                    .attr('href', '/read/' + article.id)
                    .text(article.title);

                $('<span/>')
                    .addClass('badge')
                    .text($.formatDate(article.updatedAt))
                    .appendTo($a);

                $a.appendTo($target);
            });

            // Add number of articles to category
            $('.collapsible-header').each(function () {
                var $self = $(this);
                var total = $self.next().children().children().length;

                if (total === 0) {
                    $('<p/>')
                        .text('Aucun article dans cette catégorie n\'existe , ou aucun ne vous est accessible.')
                        .appendTo($self.next().empty());
                }

                $('<span/>')
                    .addClass('badge')
                    .text(total)
                    .appendTo($self);
            });
        })
        .fail(function (res) {
            location.href = '/error/' + res.status;
        });

    $search.keyup(function (e) {
        if (e.keyCode === 13 ||  e.keyCode === 38 ||  e.keyCode === 40) return;

        var search = $search.val();

        if (prevValue === search) return;
        prevValue = search;

        var $articles = $('li .collection-item').toArray();

        $searchTarget.slideUp('fast', function () {
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
                .forEach(function (result, i) {
                    var firstClass = (i === 0) ? ' active' : '';
                    $('<a/>')
                        .attr('href', $articles[result.index].href)
                        .addClass('collection-item grey-text text-darken-2' + firstClass)
                        .html(result.rendered)
                        .appendTo($searchTarget);
                });

            if (search.length > 0) {
                if ($searchTarget.children().length > 0) {
                    $search.removeClass('invalid').addClass('valid');
                    $searchTarget.slideDown('fast');
                } else {
                    $search.removeClass('valid').addClass('invalid');
                }
            } else {
                $search.removeClass('invalid').removeClass('valid');
            }
        });
    });

    $search.keydown(function (e) {
        if (e.keyCode === 13) {
            var $active = $searchTarget.find('.active');
            if ($active.length > 0) {
                e.stopImmediatePropagation();
                location.href = $searchTarget.find('.active').attr('href');
            }
        }
        if (e.keyCode === 38) {
            var $prev = $searchTarget.find('.active').prev();
            if ($prev.length > 0) {
                $prev.addClass('active').next().removeClass('active');
            }
            e.stopImmediatePropagation();
        }
        if (e.keyCode === 40) {
            var $next = $searchTarget.find('.active').next();
            if ($next.length > 0) {
                $next.addClass('active').prev().removeClass('active');
            }
            e.stopImmediatePropagation();
        }
    });

    $title.keyup(function () {
        var val = $title.val();
        if (!titleReg.test(val)) {
            $title.removeClass('valid').addClass('invalid');
            $submitCreate.addClass('disabled').attr('disabled', '');
        } else {
            $title.removeClass('invalid').addClass('valid');
            $submitCreate.removeClass('disabled').removeAttr('disabled');
        }

        if (val === '') {
            $title.removeClass('invalid').removeClass('valid');
            $submitCreate.addClass('disabled').attr('disabled', '');
        }
    });

    $submitCreate.click(function () {
        var article = {
            title: $title.val(),
            category: $category.val(),
            isDefaultVisible: $isDefaultVi.prop('checked'),
            isDefaultEditable: $isDefaultEd.prop('checked')
        };

        $
            .ajax({
                type: 'post',
                url: '/articles/',
                contentType: 'application/json; charset=utf-8',
                data: JSON.stringify(article)
            })
            .done(function (res) {
                location.href = '/edit/' + res[0];
            })
            .fail(function (res) {
                location.href = '/error/' + res.status;
            });
    });

    $('select').material_select();
    $('.modal-trigger').leanModal();
}());
