/* Edit the rights of an article */

(function () {
    'use strict';

    var uid                = location.pathname.split('/')[2];
    var $articleTitle      = $('#articleTitle');
    var $title             = $('title');
    var $tbody             = $('table tbody');
    var $isDefaultEditable = $('#isDefaultEditable');
    var $isDefaultVisible  = $('#isDefaultVisible');
    var $save              = $('.fixed-action-btn a');

    var article;
    var rights = [];

    // Retrieve the article
    $.get('/articles/' + uid)
        .done(function (res) {
            article = res;

            $title.append(' - ' + res.title + ' - Droits');
            $articleTitle.text(res.title + ' - Droits');
            if (res.isDefaultVisible)  $isDefaultVisible .prop('checked', true);
            if (res.isDefaultEditable) $isDefaultEditable.prop('checked', true);
        })
        .fail(function (res) {
            location.href = '/error/' + res.status;
        });

    // Retrieve the article rights
    $.get('/articles/' + uid + '/rights')
        .done(function (res) {
            rights = res;

            res.forEach(function (right) {
                var $tr           = $('<tr/>').appendTo($tbody);

                // Username
                $('<td/>').text(right.user).appendTo($tr);

                // View
                var $tdView       = $('<td/>').addClass('center-align').appendTo($tr);
                var $spanView     = $('<span/>').appendTo($tdView);
                var $inputView    = $('<input type="checkbox"/>').attr('id', 'view-' + right.id).appendTo($spanView);
                                    $('<label/>').attr('for', 'view-' + right.id).text('Activé').appendTo($spanView);

                if (right.view) $inputView.prop('checked', true);

                // Edit
                var $tdEdit    = $('<td/>').addClass('center-align').appendTo($tr);
                var $spanEdit  = $('<span/>').appendTo($tdEdit);
                var $inputEdit = $('<input type="checkbox">').attr('id', 'edit-' + right.id).appendTo($spanEdit);
                                 $('<label/>').attr('for', 'edit-' + right.id).text('Activé').appendTo($spanEdit);

                if (right.edit) $inputEdit.prop('checked', true);

                // Delete
                var $tdDelete = $('<td/>').addClass('center-align').appendTo($tr);
                $('<a/>').addClass('btn red waves-effect waves-light').text('Supprimer').appendTo($tdDelete);
            });
        });

    $save.click(function () {
        var isDefaultVisible  = $isDefaultVisible .prop('checked');
        var isDefaultEditable = $isDefaultEditable.prop('checked');

        // Update main article
        $.ajax({
            url: '/articles/' + article.id,
            type: 'put',
            contentType: 'application/json; charset=utf-8',
            data: JSON.stringify({ isDefaultVisible:  isDefaultVisible, isDefaultEditable: isDefaultEditable })
        });
    });
}());
