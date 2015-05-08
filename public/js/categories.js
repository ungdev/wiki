/* Edit categories */

(function () {
    'use strict';

    var $target        = $('.target');
    var $deleteConfirm = $('#deleteConfirm');
    var $newCategory   = $('#newCategory');
    var $category      = $('.category');


    var $confirmed = $('button.modal-close');
    var $cancelled = $('a.modal-close');

    var categoryToDelete;
    var $elemToSlideUp;

    $
        .get('/categories/')
        .done(function (res) {
            res.forEach(function (category) {
                var $link = $('<li class="collection-item">' +
                    category.name +
                    '<i class="mdi-content-clear right red-text"></i>' +
                    '</li>');

                $target.append($link).children().last().children('i').click(function () {
                    categoryToDelete = category;
                    $elemToSlideUp = $link;
                    $category.text(categoryToDelete.name);
                    $deleteConfirm.openModal();
                });

                $newCategory.append('<option value="' + category.id + '">' + category.name + '</option>');
            });

            $('select').material_select();
            $('.modal-trigger').leanModal();
        })
        .fail(function (res) {
            location.href = '/error/' + res.status;
        });

    /**
     * Binds the modal footer buttons
     * Fixes materialize bug
     */
    function bind () {
        setTimeout(function () {
            $confirmed.one('click', doDelete);
            $cancelled.one('click', bind);
        });
    }

    bind();

    /**
     * Send the DELETE request
     */
    function doDelete () {
        $confirmed.addClass('disabled').attr('disabled', '');

        $
            .ajax({
                type: 'DELETE',
                url: '/categories/' + categoryToDelete.id + '/' + $newCategory.val()
            })
            .done(function () {
                $elemToSlideUp.slideUp(function () {
                    $elemToSlideUp.remove();
                    $elemToSlideUp = null;

                    $confirmed.removeClass('disabled').removeAttr('disabled');
                });
            })
            .fail(function (res) {
                location.href = '/error/' + res.status;
            });
        bind();
    }

    // Enable zen tooltip
    $('.tooltipped').tooltip();
}());
