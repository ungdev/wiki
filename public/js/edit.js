/* Read an article */

(function () {
    'use strict';

    var uid           = location.pathname.split('/')[2];
    var $articleTitle = $('#articleTitle');
    var $title        = $('title');
    var $target       = $('.target');
    var $zen          = $('#zen');
    var $bodyhtml     = $('body').add('html');
    var $editArticle  = $('#editArticle');
    var $ce;

    var editor;

    // Retrieve the article
    $
        .get('/articles/' + uid)
        .done(function (res) {

            $title.append(' - ' + res.title);
            $articleTitle.html('<a href="/read/' + res.id + '">' + res.title + '</a> - Édition');

            $target.val(res.content);

            editor = CodeMirror.fromTextArea($target[0], {
                mode: 'gfm',
                styleActiveLine: true,
                autoCloseBrackets: true,
                showTrailingSpace: true,
                autoCloseTags: true,
                viewportMargin: Infinity,
                theme: 'pastel-on-dark'
            });

            $ce = $('.CodeMirror');
        })
        .fail(function (res) {
            location.href = '/error/' + res.status;
        });

    // Zen click
    $zen.click(function (e) {
        e.preventDefault();

        var isEnabled = !$zen.children().hasClass('mdi-action-visibility');

        if (!isEnabled) {
            $zen.css('opacity', 0.6);
            $zen.children().removeClass('mdi-action-visibility').addClass('mdi-action-visibility-off');
            $ce.addClass('fullscreen');
            $bodyhtml.css({
                backgroundColor: '#2c2827',
                overflow: 'hidden'
            });
            launchIntoFullscreen(document.documentElement);
        } else {
            $zen.css('opacity', 1);
            $zen.children().removeClass('mdi-action-visibility-off').addClass('mdi-action-visibility');
            $ce.removeClass('fullscreen');
            $bodyhtml.removeAttr('style');
            exitFullscreen();
        }
    });

    $editArticle.click(function (e) {
        e.preventDefault();

        var value = editor.getValue();

        $
            .ajax({
                url: '/articles/' + uid,
                type: 'put',
                contentType: 'application/json; charset=utf-8',
                data: JSON.stringify({ content: value })
            })
            .done(function () {
                Materialize.toast('Contenu sauvegardé !', 4000);
            })
            .fail(function (res) {
                location.href = '/error/' + res.status;
            });
    });

    /**
     * Goes fullscreen on an element
     * @param {HTMLElement} element
     */
    function launchIntoFullscreen (element) {
        if      (element.requestFullscreen)       element.requestFullscreen();
        else if (element.mozRequestFullScreen)    element.mozRequestFullScreen();
        else if (element.webkitRequestFullscreen) element.webkitRequestFullscreen();
        else if (element.msRequestFullscreen)     element.msRequestFullscreen();
    }

    /**
     * Exists fullscreen
     */
    function exitFullscreen () {
        if      (document.exitFullscreen)       document.exitFullscreen();
        else if (document.mozCancelFullScreen)  document.mozCancelFullScreen();
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
        else if (document.msExitFullscreen)     document.msExitFullscreen();
    }

    // Enable zen tooltip and modals
    $('.tooltipped').tooltip();
    $('.modal-trigger').leanModal();
}());
