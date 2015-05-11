/* Menu component */

(function () {
    var $ce;
    var editor;
    var $menu    = $('#menu');
    var $arrow   = $('#arrow');
    var $ul      = $('#menu ul');
    var isOpen   = false;
    var selected = 0;

    /**
     * Initializes the menu component onto the CodeMirror editor
     * @param  {object} editor_ The CodeMirror editor
     * @param  {jQuery} $ce_    The CodeMirror div
     */
    function wikiMenu (editor_, $ce_) {
        editor = editor_;
        $ce    = $ce_;

        editor.setOption('extraKeys', {
            Enter: function (cm) {
                if (!isOpen) cm.replaceSelection('\n');
            },
            Down: function (cm) {
                if (!isOpen) cm.execCommand('goLineDown');
            },
            Up: function (cm) {
                if (!isOpen) cm.execCommand('goLineUp');
            },
            Left: function (cm) {
                cm.execCommand('goCharLeft');
                if (isOpen) setTimeout(openMenu, 50);
            },
            Right: function (cm) {
                cm.execCommand('goCharRight');
                if (isOpen) setTimeout(openMenu, 50);
            },
            Esc: function () {
                if (isOpen) setTimeout(closeMenu, 50);
            }
        });

        var lastDate = 0;
        $(document)
            .keyup(function (e) {
                if (e.keyCode !== 16) return;

                var thisDate = new Date();
                if (thisDate - lastDate < 400) {
                    openMenu();
                    thisDate = 0;
                }
                lastDate = thisDate;
            })
            .click(function () {
                if (isOpen) closeMenu();
            })
            .keydown(function (e) {
                if (!isOpen) return;

                if (e.keyCode === 13) {
                    e.preventDefault();
                    selectResult();
                } else if (e.keyCode === 38) {
                    e.preventDefault();
                    prevResult();
                } else if (e.keyCode === 40) {
                    e.preventDefault();
                    nextResult();
                }
            });
    }

    $ul.children().click(function (e) {
        var $self = $(this);
        e.stopPropagation();

        if ($self.hasClass('selected')) {
            selectResult();
        } else {
            $ul.children().removeClass('selected');
            selected = $self.addClass('selected').index();
        }
    });

    /**
     * Opens the helper menu
     */
    function openMenu () {
        isOpen = true;
        var cursor = editor.display.cursorDiv.children[0];

        if (!cursor) return;

        $menu.fadeIn('fast');

        $menu.css({
            top:  parseFloat(cursor.style.top) + $ce.position().top + 40 + 'px',
            left: parseFloat(cursor.style.left) + $ce.position().left - 125 + 'px'
        });

        // Only when left/top animation has finished
        setTimeout(function () {
            var menuPos = $menu.position();

            if (menuPos.left < 0) {
                var diff = Math.max(5 + menuPos.left, -95);
                $arrow.css('left', 'calc(50% + ' + diff + 'px - 10px)');
                $menu.css('left', '5px');
            } else {
                $arrow.css('left', '50%');
            }
        }, 120);
    }

    /**
     * Closes the helper menu
     */
    function closeMenu () {
        $menu.fadeOut('fast');
        isOpen = false;
    }

    /**
     * Move the selected helper up
     */
    function prevResult () {
        var $currentSelected = $('.autocomplete-item.selected');
        var $prev            = $currentSelected.prev();

        $ul.scrollTop($ul.scrollTop() - $currentSelected.height() - 5);

        if ($prev.length > 0) {
            --selected;
            $currentSelected.removeClass('selected');
            $prev.addClass('selected');
        }
    }

    /**
     * Moves the selected helper down
     */
    function nextResult () {
        var $currentSelected = $('.autocomplete-item.selected');
        var $next            = $currentSelected.next();

        $ul.scrollTop($ul.scrollTop() + $currentSelected.height() + 5);

        if ($next.length > 0) {
            ++selected;
            $currentSelected.removeClass('selected');
            $next.addClass('selected');
        }
    }

    /**
     * Inserts the snippet onto the Codemirror editor
     */
    function selectResult () {
        var $li = $ul.children().eq(selected);
        var insert = $li.data('insert').replace(/\\n/g, '\n');
        var pos = ($li.data('no-cursor')) ? insert.length : insert.indexOf('|');

        if (pos !== insert.length) {
            insert = insert.slice(0, pos) + insert.slice(pos + 1, insert.length);
        }

        var actualPos = editor.getCursor();
        actualPos.ch = actualPos.ch + pos;

        editor.replaceSelection(insert);
        closeMenu();

        editor.setCursor(actualPos);
    }

    window.wikiMenu = wikiMenu;
}());
