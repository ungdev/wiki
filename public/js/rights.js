/* Edit the rights of an article */

(function () {
    'use strict';

    var uid                = location.pathname.split('/')[2];
    var $articleTitle      = $('#articleTitle');
    var $title             = $('title');
    var $tbody             = $('table tbody');
    var $isDefaultEditable = $('#isDefaultEditable');
    var $isDefaultVisible  = $('#isDefaultVisible');

    // Retrieve the article
    $.get('/articles/' + uid)
        .done(function (res) {
            $title.append(' - ' + res.title + ' - Droits');
            $articleTitle.text(res.title + ' - Droits');
    console.log($isDefaultVisible);
            if (res.isDefaultVisible)  $isDefaultVisible .prop('checked', true);
            if (res.isDefaultEditable) $isDefaultEditable.prop('checked', true);
        })
        .fail(function (res) {
            location.href = '/error/' + res.status;
        });

    // Retrieve the article rights
    $.get('/articles/' + uid + '/rights')
        .done(function (res) {
            console.log(res);
            res.forEach(function (right) {
                var $tr           = $('<tr/>')
                    .appendTo($tbody);
                $('<td/>')
                    .text(right.user)
                    .appendTo($tr);

                var $tdView       = $('<td/>')
                    .addClass('center-align')
                    .appendTo($tr);
                var $spanView     = $('<span/>')
                    .appendTo($tdView);
                var $inputView    = $('<input/>')
                    .attr('type', 'checkbox')
                    .attr('id', 'view-' + right.id)
                    .appendTo($spanView);
                $('<label/>')
                    .attr('for', 'view-' + right.id)
                    .text('Activé')
                    .appendTo($spanView);

                if (right.view) $inputView.prop('checked', true);

                var $tdEdit       = $('<td/>')
                    .addClass('center-align')
                    .appendTo($tr);
                var $spanEdit     = $('<span/>')
                    .appendTo($tdEdit);
                var $inputEdit    = $('<input/>')
                    .attr('type', 'checkbox')
                    .attr('id', 'edit-' + right.id)
                    .appendTo($spanEdit);
                $('<label/>')
                    .attr('for', 'edit-' + right.id)
                    .text('Activé')
                    .appendTo($spanEdit);

                if (right.edit) $inputEdit.prop('checked', true);

                var $tdDelete     = $('<td/>')
                    .addClass('center-align')
                    .appendTo($tr);
                $('<a/>')
                    .addClass('btn red waves-effect waves-light')
                    .text('Supprimer')
                    .appendTo($tdDelete);
            });
        });
}());
