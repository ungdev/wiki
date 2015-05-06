/* Login */

(function () {
    'use strict';

    var $login = $('#login');

    $login.click(function () {
        $login.addClass('disabled').attr('disabled', '');
        $.get('login/getURL')
            .done(function (res) {
                location.href = res.url;
            })
            .fail(function (res) {
                location.href = '/error/' + res.status;
            });
    });
}());
