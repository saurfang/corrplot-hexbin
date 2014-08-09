'use strict';

/**
 * @ngdoc function
 * @name heatmapApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the heatmapApp
 */
angular.module('heatmapApp')
    .factory('dataFactory', ['$http', function ($http) {
        var factory = {};

        factory.fetch = function (dataset) {
            return $http.get('assets/' + dataset).then(function (resp) {
                return resp.data;
            });
        };

        //http://stevegardner.net/2012/06/11/javascript-code-to-calculate-the-pearson-correlation-coefficient/
        factory.getPearsonsCorrelation = function (data, getX, getY) {
            var sum_x = 0;
            var sum_y = 0;
            var sum_xy = 0;
            var sum_x2 = 0;
            var sum_y2 = 0;

            data.forEach(function(d){
                var x = getX(d), y = getY(d);
                if(isFinite(x) && isFinite(y)){
                    sum_x += x;
                    sum_y += y;
                    sum_xy += x * y;
                    sum_x2 += x * x;
                    sum_y2 += y * y;
                }
            });

            var step1 = (data.length * sum_xy) - (sum_x * sum_y);
            var step2 = (data.length * sum_x2) - (sum_x * sum_x);
            var step3 = (data.length * sum_y2) - (sum_y * sum_y);
            var step4 = Math.sqrt(step2 * step3);
            var answer = step1 / step4;

            return answer;
        };

        return factory;
    }]);
