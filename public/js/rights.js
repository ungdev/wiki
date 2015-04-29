/* Edit the rights of an article */

(function () {
    'use strict';

    var uid           = location.pathname.split('/')[2];
    var $articleTitle = $('#articleTitle');
    var $title        = $('title');

    // Retrieve the article
    $.get('/articles/' + uid)
        .done(function (res) {
            $title.append(' - ' + res.title + ' - Droits');
            $articleTitle.text(res.title + ' - Droits');
        })
        .fail(function (res) {
            location.href = '/error/' + res.status;
        });

    // Retrieve the article rights
    $.get('/articles/' + uid + '/rights')
        .done(function (res) {
            console.log(res);
        });
}());
