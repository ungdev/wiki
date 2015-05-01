/* Read an article */

(function () {
    'use strict';

    var uid            = location.pathname.split('/')[2];
    var $articleTitle = $('#articleTitle');
    var $title        = $('title');
    var $target       = $('.target');
    var $zen          = $('#zen');

    var editor;

    // Retrieve the article
    $.get('/articles/' + uid)
        .done(function (res) {

            $title.append(' - ' + res.title);
            $articleTitle.text(res.title);

            $target.val(res.content);

            editor = CodeMirror.fromTextArea($target[0], {
                mode: 'gfm',
                styleActiveLine: true,
                lineNumbers: true,
                autoCloseBrackets: true,
                showTrailingSpace: true,
                autoCloseTags: true,
                viewportMargin: Infinity
            });
        })
        .fail(function (res) {
            location.href = '/error/' + res.status;
        });

    // Zen click
    $zen.click(function () {
        var isEnabled = !$zen.children().hasClass('mdi-action-visibility');

        if (!isEnabled) {
            $zen.css('opacity', 0.6);
            $zen.children().removeClass('mdi-action-visibility').addClass('mdi-action-visibility-off');
            $('.read > .row:first-child').slideUp();
            $('body').attr('style', 'background-color: #333;color: rgba(255, 255, 255, 0.6) !important');
        } else {
            $zen.css('opacity', 1);
            $zen.children().removeClass('mdi-action-visibility-off').addClass('mdi-action-visibility');
            $('.read > .row:first-child').slideDown();
            $('body').removeAttr('style');
        }
    });

    // Enable zen tooltip and modals
    $('.tooltipped').tooltip();
    $('.modal-trigger').leanModal();
}());
