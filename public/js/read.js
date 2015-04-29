/* Read an article */

(function () {
    'use strict';

    var uid            = location.pathname.split('/')[2];
    var $articleTitle = $('#articleTitle');
    var $title        = $('title');
    var $target       = $('.target');
    var $zen          = $('#zen');
    var $editBtn      = $('.fixed-action-btn');
    var $retypeName   = $('#retypeName');
    var $delete       = $('.modal-footer button.disabled');

    // Retrieve the article
    $.get('/articles/' + uid)
        .done(function (res) {

            $title.append(' - ' + res.title);
            $articleTitle.text(res.title);
            $retypeName.attr('placeholder', res.title);
            $retypeName.next().addClass('active');

            var html = marked(res.content, {
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
            location.href = '/error/' + res.status;
        });

    // Zen click
    $zen.click(function () {
        var isEnabled = !$zen.children().hasClass('mdi-action-visibility');

        if (!isEnabled) {
            $zen.css('opacity', 0.6);
            $editBtn.fadeOut();
            $zen.children().removeClass('mdi-action-visibility').addClass('mdi-action-visibility-off');
            $('.read > .row:first-child').slideUp();
            $('body').attr('style', 'background-color: #333;color: rgba(255, 255, 255, 0.6) !important');
        } else {
            $zen.css('opacity', 1);
            $editBtn.fadeIn();
            $zen.children().removeClass('mdi-action-visibility-off').addClass('mdi-action-visibility');
            $('.read > .row:first-child').slideDown();
            $('body').removeAttr('style');
        }
    });

    // Remove article
    $retypeName.keyup(function () {
        if ($retypeName.val() === $retypeName.attr('placeholder')) {
            $retypeName.removeClass('invalid').addClass('valid');
            $delete.removeClass('disabled').removeAttr('disabled');
        } else {
            $retypeName.removeClass('valid').addClass('invalid');
            $delete.addClass('disabled').attr('disabled', '');
        }
    });

    $delete.click(function () {
        $.ajax({ url: '/articles/' + uid, type: 'DELETE' })
            .done(function () {
                location.href = '/';
            })
            .fail(function (res) {
                location.href = '/error/' + res.status;
            });
    });

    // Enable zen tooltip and modals
    $('.tooltipped').tooltip();
    $('.modal-trigger').leanModal();
}());
