/* Utils functions */

(function () {
    /**
     * Pads a number to 2 decimals
     * @param   {Number} n The number
     * @returns {string}   The padded string
     */
    var pad2 = function (n) {
        return n < 10 ? '0' + n : '' + n
    };

    /**
     * Formats a date
     * @param   {Date|string} date_      The input date
     * @param   {Boolean}     [showHour] Shall the format includes hour:minutes
     * @returns {string}                 The formatted date
     */
    $.formatDate = function (date_, showHour) {
        var date = (date_ instanceof Date) ? date_ : new Date(date_);

        var formatted = pad2(date.getDate()) + '/' + pad2(date.getMonth()) + '/' + pad2(date.getFullYear());
        if (showHour) formatted += ' - ' + pad2(date.getHours()) + ':' + pad2(date.getMinutes());

        return formatted;
    };
}());
