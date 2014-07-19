(function(){
    'use strict';

    //http://pastebin.com/pZGAL3GE
    if (!String.prototype.width) String.prototype.width = function(font, options) {
        var f, o, w;

        if (typeof options == 'undefined') options = {};

        if (typeof font == 'object')
            f = font.css('font-size') + ' ' + font.css('font-family');
        else
            f = font || '12px arial';

        o = String.prototype.width.persisted ||
            $('<div id="dailyjs-stringWidth" />')
                .css({'position': 'absolute', 'float': 'left', 'visibility': 'hidden', 'font': f})
                .appendTo($('body'));

        $('#dailyjs-stringWidth').html('<span>' + this + '</span>');

        w = o.width();

        if (String.prototype.width.persisted || options.persist)
            String.prototype.width.persisted = o;
        else
            o.remove();

        return w;
    };

})();
