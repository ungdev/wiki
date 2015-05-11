/* Edit categories */

(function () {
    'use strict';

    var $target        = $('.target');
    var $deleteConfirm = $('#deleteConfirm');
    var $category      = $('.category');

    var $addCategory          = $('#addCategory');
    var $newCategory          = $('#newCategory');
    var $createCategory       = $('#createCategory');
    var $createCategoryOpener = $('#createCategoryOpener');
    var $createCategorySubmit = $('button.modal-close', $createCategory);
    var $cancelCategorySubmit = $('a.modal-close', $createCategory);

    var $confirmed = $('button.modal-close', $deleteConfirm);
    var $cancelled = $('a.modal-close', $deleteConfirm);

    var categoryToDelete;
    var $elemToSlideUp;

    $
        .get('/categories/')
        .done(function (res) {
            res.forEach(function (category) {
                addRow(category);
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
            $createCategorySubmit.one('click', doCreate);
            $cancelCategorySubmit.one('click', bind);
        });
    }

    bind();

    /**
     * Sends the DELETE request
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

    /**
     * Sends the POST request
     */
    function doCreate () {
        var value = $addCategory.val();
        $
            .ajax({
                type: 'post',
                url: '/categories/',
                contentType: 'application/json; charset=utf-8',
                data: JSON.stringify({ name: value })
            })
            .done(function (res) {
                addRow({
                    name: value,
                    id: res[0]
                });
                $('select').material_select();
            })
            .fail(function (res) {
                location.href = '/error/' + res.status;
            });
        bind();
    }

    /**
     * Add a line (category) to the collection
     * @param  {object} category The category to add
     */
    function addRow (category) {
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
    }

    // Enable zen tooltip and modal
    $('.tooltipped').tooltip();
    $createCategoryOpener.click(function (e) {
        e.preventDefault();
        $createCategory.openModal();
    });
}());
