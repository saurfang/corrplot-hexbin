'use strict';

/**
 * @ngdoc function
 * @name heatmapApp.controller:HexbinCtrl
 * @description
 * # HexbinCtrl
 * Controller of the heatmapApp
 */
angular.module('heatmapApp')
    .controller('hexbinCtrl', ['$rootScope', '$scope',
        function ($rootScope, $scope) {
            $scope.binSize = 3;
            $scope.points = [];
            $scope.labs = ['', ''];

            var smartFormat = function(x) {
                if(Math.abs(x) >= 1e3) {
                    return d3.format('2.2s')(x);
                }else if(Math.abs(x) > 1){
                    return d3.format('.1f')(x);
                }else if(Math.abs(x) >= 0.01){
                    return d3.format('.2f')(x);
                }else if(Math.abs(x) === 0) {
                    return '0';
                }else{
                    return d3.format('.2e')(x);
                }
            };
            $scope.numericFormat = [smartFormat, smartFormat];

            $scope.initSlider = function () {
                var binSizeChange = function () {
                    $scope.binSize = slider.getValue();
                    $scope.$apply();
                };

                var slider = $('#binSize').slider({formater: d3.format('.1f')})
                    .slider('setValue', $scope.binSize)
                    .on('slideStop', binSizeChange)
                    .data('slider');
            };

            //Count bin by summing each point's weight
            $scope.wtCount = function(d) {
                return d.reduce(function(acc, cur){
                    return acc + cur[2];
                }, 0);
            };

            $scope.color = d3.scale.linear()
                .domain([0, 20])
                .range(['white', 'steelblue'])
                .interpolate(d3.interpolateLab);

            $scope.tip = function (d) {
                var agg = d.reduce(function (acc, cur) {
                    return [acc[0] + cur[0] * cur[2] , acc[1] + cur[1] * cur[2], acc[2] + cur[2]];
                }, [0, 0, 0]);

                var x = d3.format('.2f')(agg[0] / agg[2]);
                var y = d3.format('.2f')(agg[1] / agg[2]);

                return '<span>(' + x + ',' + y + '): ' + agg[2] + '</span>';
            };

            $scope.showHistogram = false;
            $scope.$onRootScope('hexbinChanged', function () {
                $scope.showHistogram = false;
                $scope.points = $rootScope.selectedHexbins;

                $scope.labs = $rootScope.selectedVars;
            });

            $scope.initHistogram = function () {
                var values = [], data = [];
                // A formatter for counts.
                var formatCount = d3.format(',.0f');

                var margin = {top: 10, right: 30, bottom: 30, left: 30},
                    side = $('#hexbin').width(),
                    width = side - margin.left - margin.right,
                    height = side - margin.top - margin.bottom;

                var x = d3.scale.linear()
                    .domain([0, 1])
                    .range([0, width]);

                var y = d3.scale.linear()
                    .domain([0, d3.max(data, function (d) {
                        return d.y;
                    })])
                    .range([height, 0]);

                var xAxis = d3.svg.axis()
                    .scale(x)
                    .orient('bottom');

                var svg = d3.select('#histogram').append('svg')
                    .attr('width', width + margin.left + margin.right)
                    .attr('height', height + margin.top + margin.bottom)
                    .append('g')
                    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

                var bar = svg.selectAll('.bar');

                svg.append('g')
                    .attr('class', 'x axis')
                    .attr('transform', 'translate(0,' + height + ')')
                    .call(xAxis);

                var redraw = function () {
                    values = values.map(function (d) { return d[0]; });
                    x = x.domain(d3.extent(values));
                    svg.select('.x.axis').call(xAxis);
                    var data = d3.layout.histogram()
                        .bins(x.ticks(20))(values);

                    y = y.domain([0, d3.max(data, function (d) { return d.y; })]);

                    bar = bar.data(data);

                    bar.exit().remove();

                    var newBar = bar.enter().append('g')
                        .attr('class', 'bar');
                    newBar.append('rect')
                        .attr('x', 1);
                    newBar.append('text')
                        .attr('dy', '.75em')
                        .attr('y', 6);

                    bar.attr('transform', function (d) {
                        return 'translate(' + x(d.x) + ',' + y(d.y) + ')';
                    });

                    bar.select('rect')
                        .attr('width', x(data[0].dx + x.domain()[0]) - 1)
                        .attr('height', function (d) {
                            return height - y(d.y);
                        });

                    bar.select('text')
                        .attr('x', x(data[0].dx + x.domain()[0]) / 2)
                        .attr('text-anchor', 'middle')
                        .text(function (d) {
                            return formatCount(d.y);
                        });
                };

                $scope.$onRootScope('histogramChanged', function () {
                    $scope.showHistogram = true;
                    values = $rootScope.selectedValues;
                    //redrawAxis($rootScope.selectedVar);
                    redraw();
                });
            };
        }]);