/* Read an article */

(function () {
    'use strict';

    var socket = io();

    var uid           = location.pathname.split('/')[2];
    socket.emit('join', uid);

    var $articleTitle = $('#articleTitle');
    var $title        = $('title');
    var $target       = $('.target');
    var $preview      = $('#preview');
    var $zen          = $('#zen');
    var $modeChange   = $('#modeChange');
    var $bodyhtml     = $('body').add('html');
    var $editArticle  = $('#editArticle');
    var suppress      = false;
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
                theme: 'pastel-on-dark',
                historyEventDelay: 400
            });

            window.ce = editor;

            if (localStorage.hasOwnProperty(uid) && localStorage.getItem(uid) !== editor.getValue()) {
                Materialize.toast('<span>Restaurer le contenu ?</span><a href="#" class="btn-flat yellow-text right restore">Oui<a>', 4000);
                $('.restore').one('click', function () {
                    editor.setValue(localStorage.getItem(uid));
                });
            }

            var debouncer = 0;
            editor.on('change', function (cm, change) {
                clearTimeout(debouncer);
                debouncer = setTimeout(doPreview(editor), 500);
                if (suppress) return;
                gotChange(cm, change);
            });

            socket.on('getLastVersion', function () {
                console.log('Someone asked for the last version');
                socket.emit('answerLastVersion', editor.getValue());
            });

            socket.once('answerLastVersion', function (value) {
                console.log('Set last version from the others');
                suppress = true;
                editor.setValue(value);
                suppress = false;
            });

            socket.on('remove', function (pos, length) {
                suppress = true;
                var from = editor.posFromIndex(pos);
                var to   = editor.posFromIndex(pos + length);
                editor.replaceRange('', from, to);
                suppress = false;
            });

            socket.on('insert', function (pos, text) {
                suppress = true;
                editor.replaceRange(text, editor.posFromIndex(pos));
                suppress = false;
            });

            setTimeout(doPreview(editor), 50);

            $ce = $('.CodeMirror');

            wikiMenu(editor, $ce);
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
            $modeChange.fadeOut('fast');
            $bodyhtml.css({
                backgroundColor: '#2c2827',
                overflow: 'hidden'
            });
            $preview.fadeOut('fast');
            launchIntoFullscreen(document.documentElement);
        } else {
            $zen.css('opacity', 1);
            $zen.children().removeClass('mdi-action-visibility-off').addClass('mdi-action-visibility');
            $modeChange.fadeIn('fast');
            $ce.removeClass('fullscreen');
            $bodyhtml.removeAttr('style');
            $preview.fadeIn('fast');
            exitFullscreen();
        }
    });

    $editArticle.click(function (e) {
        e.preventDefault();

        var value = editor.getValue();

        $editArticle.addClass('disabled').attr('disabled', '');

        $
            .ajax({
                url: '/articles/' + uid,
                type: 'put',
                contentType: 'application/json; charset=utf-8',
                data: JSON.stringify({ content: value })
            })
            .done(function () {
                localStorage.setItem(uid, value);
                $editArticle.removeClass('disabled').removeAttr('disabled');
                Materialize.toast('Contenu sauvegardé !', 4000);
            })
            .fail(function (res) {
                location.href = '/error/' + res.status;
            });
    });

    var actualMode = 1;
    $modeChange.click(function (e) {
        e.preventDefault();
        ++actualMode;
        actualMode = actualMode % 3;
        if (actualMode === 0) {
            $target.parent().css({ padding: '0 0.75rem', width: '100%' });
            $preview.parent().css({ padding: '0', width: '0%' });
        } else if (actualMode === 1) {
            $target.parent().css({ padding: '0 0.75rem', width: '50%' });
            $preview.parent().css({ padding: '0 0.75rem', width: '50%' });
        } else {
            $target.parent().css({ padding: '0', width: '0%' });
            $preview.parent().css({ padding: '0 0.75rem', width: '100%' });
        }
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

    /**
     * Does renders the preview
     * @param   {object}   editor CodeMirror object
     * @returns {Function}        A function binded with the editor
     */
    function doPreview (editor) {
        return function () {
            var html = marked(editor.getValue(), {
                breaks: true,
                sanitize: true,
                highlight: function (code) {
                    return hljs.highlightAuto(code).value;
                }
            });
            $preview.html(html);

            // Fix https://github.com/chjj/marked/issues/255
            $('pre code').addClass('hljs');

            // KateX
            renderMathInElement($preview[0]);
        }
    }


    function gotChange (cm, change) {
        var startPos = change.from.ch;
        var i        = 0;

        while (i < change.from.line) {
            startPos += cm.lineInfo(i).text.length + 1;
            i++;
        }

        var inserted = change.to.line === change.from.line && change.to.ch === change.from.ch;
        if (!inserted) {
            var delLen = change.removed.length - 1;
            for (var rm = 0; rm < change.removed.length; rm++) {
                delLen += change.removed[rm].length;
            }

            socket.emit('remove', startPos, delLen);
        }

        if (change.text) socket.emit('insert', startPos, change.text.join('\n'));
        if (change.next) gotChange(cm, change.next);
    }

    // Auto save in localStorage
    setTimeout(function autoSave () {
        var value = editor.getValue();
        if (localStorage.hasOwnProperty(uid) && localStorage.getItem(uid) === value) return;

        localStorage.setItem(uid, value);
        Materialize.toast('Contenu auto-sauvegardé localement', 3000);
        setTimeout(autoSave, 30 * 1000);
    }, 30 * 1000);

    // Enable zen tooltip and modals
    $('.tooltipped').tooltip();
    $('.modal-trigger').leanModal();
}());
