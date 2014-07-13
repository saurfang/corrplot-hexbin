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
                var side = $('#correlation').width() / ($scope.vars.length + 1);
                $scope.corCol = {width: side + 'px'};
                $scope.corRow = {height: side + 'px'};
            };

            angular.element($window).bind('resize', function() {
                adjustStyle();
                return $scope.$apply();
            });

            $scope.vars = [];
            var values = [];
            $scope.correlations = [];
            var parseCSV = function(response) {
                values = d3.csv.parse(response);
                $scope.vars = Object.keys(values[0]);

                //Compute correlations
                var correlations = [];
                $scope.vars.forEach(function(varX){
                    var correlation = {var: varX};
                    var x = values.map(function(d){ return +d[varX]; });
                    $scope.vars.forEach(function(varY){
                        var y = values.map(function(d){ return +d[varY]; });
                        correlation[varY] = dataFactory.getPearsonsCorrelation(x, y);
                    });
                    correlations.push(correlation);
                });
                $scope.correlations = correlations;
                $scope.tableParams.reload();

                adjustStyle();
            };
            $scope.dataset = 'iris';
            $scope.$watch('dataset', function(dataset){
                dataFactory.fetch(dataset).then(parseCSV);
            });

            var reader = new FileReader();
            reader.onload = function(e) {
                parseCSV(reader.result);
            }

            $scope.uploadFile = function(files) {
                reader.readAsText(files[0]);
            };

            $scope.updateHexbin = function(rowX, varY){
                if(isFinite(rowX[varY])){
                    var varX = rowX.var;
                    $rootScope.selectedVars = [varX, varY];
                    $rootScope.selectedHexbins = values.map(function(d){
                        return [+d[varX], +d[varY], 1];
                    })
                    $rootScope.$emit('hexbinChanged');
                }
            };

            $scope.format = d3.format('%.2f');
            $scope.isFinite = isFinite;

            var color = d3.scale.linear()
                    .domain(d3.range(-1, 1, .2))
                    .range(colorbrewer.RdYlGn[11])
                    .interpolate(d3.interpolateLab);

            $scope.color = function(row, feature){
                if(row.var === feature || isNaN(row[feature])){
                   return 'white';
                }else{
                   return color(row[feature]);
                }
            };

            $scope.tableParams = new ngTableParams({
                page: 1,            // show first page
                count: $scope.vars.length           // count per page
            }, {
                counts: [],         // hide page counts control
                total: $scope.vars.length, // length of data
                getData: function ($defer, params) {
                    $defer.resolve($scope.correlations);
                }
            });
        }]);