'use strict';

/**
 * @ngdoc overview
 * @name heatmapApp
 * @description
 * # heatmapApp
 *
 * Main module of the application.
 */
angular
    .module('heatmapApp', [
        'ngAnimate',
        'ngCookies',
        'ngResource',
        'ngRoute',
        'ngSanitize',
        'ngTouch',
        'ngTable'
    ])
    .config(function ($provide) {
        $provide.decorator('$rootScope', ['$delegate', function($delegate){

            Object.defineProperty($delegate.constructor.prototype, '$onRootScope', {
                value: function(name, listener){
                    var unsubscribe = $delegate.$on(name, listener);
                    this.$on('$destroy', unsubscribe);

                    return unsubscribe;
                },
                enumerable: false
            });


            return $delegate;
        }]);
    });

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