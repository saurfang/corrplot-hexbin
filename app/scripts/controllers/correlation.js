'use strict';

/**
 * @ngdoc function
 * @name heatmapApp.controller:correlationCtrl
 * @description
 * # correlationCtrl
 * Controller of the heatmapApp
 */
angular.module('heatmapApp')
    .controller('correlationCtrl', ['$rootScope', '$scope', 'dataFactory', 'ngTableParams', '$window',
        function ($rootScope, $scope, dataFactory, ngTableParams, $window) {
            $scope.corCol = {};
            $scope.corRow = {};
            var adjustStyle = function() {
                var side = $('#correlation').width() / ($scope.traits.length + 1);
                $scope.corCol = {width: side + 'px'};
                $scope.corRow = {height: side + 'px'};
            };

            angular.element($window).bind('resize', function() {
                adjustStyle();
                return $scope.$apply();
            });

            //FIXME: pretty sure this is wrong
            $scope.traits = [];
            var values = [];
            $scope.correlations = [];
            dataFactory.flowers().then(function (response) {
                $scope.traits = response.traits;
                values = response.values;

                //Compute correlations
                var correlations = [];
                $scope.traits.forEach(function(traitX){
                    var correlation = {trait: traitX};
                    var x = values.map(function(d){ return d[traitX]; });
                    $scope.traits.forEach(function(traitY){
                       var y = values.map(function(d){ return d[traitY]; });
                        correlation[traitY] = dataFactory.getPearsonsCorrelation(x, y);
                    });
                    correlations.push(correlation);
                });
                $scope.correlations = correlations;
                $scope.tableParams.reload();

                adjustStyle();
            });

            $scope.updateHexbin = function(traitX, traitY){
              $rootScope.selectedTraits = [traitX, traitY];
              $rootScope.selectedHexbins = values.map(function(d){
                  return [d[traitX], d[traitY], 1];
              })
              $rootScope.$emit('hexbinChanged');
            };

            $scope.format = d3.format('%.2f');

            var color = d3.scale.linear()
                    .domain(d3.range(-1, 1, .2))
                    .range(colorbrewer.RdYlGn[11])
                    .interpolate(d3.interpolateLab);

            $scope.color = function(row, feature){
                if(row.trait === feature){
                   return 'white';
                }else{
                   return color(row[feature]);
                }
            };

            $scope.tableParams = new ngTableParams({
                page: 1,            // show first page
                count: $scope.traits.length           // count per page
            }, {
                counts: [],         // hide page counts control
                total: $scope.traits.length, // length of data
                getData: function ($defer, params) {
                    // use build-in angular filter
                    var orderedData = $scope.correlations;

                    $defer.resolve(orderedData);
                }
            });
        }]);