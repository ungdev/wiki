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
    var $addUsername       = $('#addUsername');
    var $addUsernameBtn    = $('.modal-footer button.disabled');

    // Used to make ids for creating rights
    var incr = 0;

    var article;
    var rights = [];

    // Retrieve the article
    $.get('/articles/' + uid)
        .done(function (res) {
            article = res;

            $title.append(' - ' + res.title + ' - Droits');
            $articleTitle.html('<a href="/read/' + res.id + '">' + res.title + '</a> - Droits');
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
                addLine(right);
            });
        });

    // Save rights
    $save.click(function () {
        if ($save.hasClass('disabled')) return;

        $save.addClass('disabled');

        var isDefaultVisible  = $isDefaultVisible .prop('checked');
        var isDefaultEditable = $isDefaultEditable.prop('checked');
        var promises = [];

        // Update main article
        promises.push($.ajax({
            url: '/articles/' + article.id,
            type: 'put',
            contentType: 'application/json; charset=utf-8',
            data: JSON.stringify({ isDefaultVisible:  isDefaultVisible, isDefaultEditable: isDefaultEditable })
        }));

        // Delete initial rights
        rights.forEach(function (right) {
            console.log(right);
            promises.push($.ajax({
                url: '/rights/' + right.id,
                type: 'delete'
            }));
        });

        // Create the new rights
        $tbody.children().each(function () {
            var $self = $(this);
            var user = $self.children().first().text();
            var view = $self.children().eq(1).children().children('input').prop('checked');
            var edit = $self.children().eq(2).children().children('input').prop('checked');

            promises.push($.ajax({
                type: 'post',
                url: '/rights/',
                contentType: 'application/json; charset=utf-8',
                data: JSON.stringify({ article: article.id, user: user, view: view, edit: edit })
            }));
        });

        $.when.apply($, promises)
            .done(function () {
                Materialize.toast('Droits sauvegardés !', 4000);
            })
            .fail(function (res) {
                location.href = '/error/' + res.status;
            });
    });

    // Username must be written to enable button
    $addUsername.keyup(function () {
        if ($addUsername.val().length > 2 && $addUsername.val().match(/^[\w\d_-]+$/)) {
            $addUsername.removeClass('invalid').addClass('valid');
            $addUsernameBtn.removeClass('disabled').removeAttr('disabled');
        } else {
            $addUsername.removeClass('valid').addClass('invalid');
            $addUsernameBtn.addClass('disabled').attr('disabled', '');
        }
    });

    // Right adding
    $addUsernameBtn.click(function () {
        addLine({
            id: incr,
            user: $addUsername.val(),
            view: false,
            edit: false
        });
        ++incr;
        $addUsername.val('');
    });

    function addLine (right) {
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
        $('<a/>').addClass('btn red waves-effect waves-light').text('Supprimer').appendTo($tdDelete)
            .click(function (e) {
                e.preventDefault();
                $tr.fadeOut(function () {
                    $tr.remove();
                });
            });
    }

    // Enable zen tooltip and modals
    $('.tooltipped').tooltip();
    $('.modal-trigger').leanModal();
}());
