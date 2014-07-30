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
        'ngTable',
        'angular-d3-hexbin',
        'ui.bootstrap'
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