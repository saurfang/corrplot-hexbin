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
            $scope.style = {rowHead: {}, row: {}, colHead: {}, table: {}};
            var showVal = true;
            var adjustStyle = function() {
                var maxWidth = d3.max($scope.vars.map(function(v){return v.width();})) + 16;
                $scope.style.colHead.height =  maxWidth + 'px';
                $scope.style.rowHead.width = maxWidth + 'px';

                var side = ($('#correlation').parent().width() - maxWidth) / $scope.vars.length;
                $scope.style.colHead.width =  side + 'px';
                $scope.style.row.height = side + 'px';

                showVal = side > 32;

                //FIXME: This is not ideal because font-size and side have circular dependency
                $scope.style.table['font-size'] = (side < 14 ? side : 14) + 'px';
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
                    var correlation = {name: varX, values: {}};
                    var x = values.map(function(d){ return +d[varX]; });
                    $scope.vars.forEach(function(varY){
                        var y = values.map(function(d){ return +d[varY]; });
                        correlation.values[varY] = dataFactory.getPearsonsCorrelation(x, y);
                    });
                    correlations.push(correlation);
                });
                $scope.correlations = correlations;
                $scope.tableParams.reload();

                adjustStyle();
            };
            $scope.dataset = 'iris.csv';
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

            $scope.updateSelection = function(rowX, varY){
                if(isFinite(rowX.values[varY])){
                    var varX = rowX.name;
                    if(varX === varY){
                        $rootScope.selectedVar = varX;
                        $rootScope.selectedValues = values.map(function(d){
                            return [+d[varX], 1];
                        })
                        $rootScope.$emit('histogramChanged');
                    }else{
                        $rootScope.selectedVars = [varX, varY];
                        $rootScope.selectedHexbins = values.map(function(d){
                            return [+d[varX], +d[varY], 1];
                        })
                        $rootScope.$emit('hexbinChanged');
                    }
                }
            };

            $scope.format = d3.format('%.2f');
            $scope.isFinite = isFinite;
            $scope.tooltip = function(row, name) {
                if(row.name === name){
                    return name;
                }else{
                    var tooltip = row.name + ' vs. ' + name;
                    var value = row.values[name];
                    if(!showVal && isFinite(value)){
                        tooltip += '<br/>' + $scope.format(value);
                    }
                    return tooltip;
                }
            };
            $scope.showVal = function(row, name){
                return showVal && row.name !== name && isFinite(row.values[name]);
            };

            $scope.colorScale = d3.scale.linear()
                    .domain(d3.range(-1, 1, .2))
                    .range(colorbrewer.RdYlGn[11])
                    .interpolate(d3.interpolateLab);

            $scope.color = function(row, name){
                if(isNaN(row.values[name])){
                   return 'white';
                }else{
                   return $scope.colorScale(row.values[name]);
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