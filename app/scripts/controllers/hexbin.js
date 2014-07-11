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
            $scope.binSize = 20;

            var numberHues = 20;
            var color = d3.scale.linear()
                .domain([0, 15])
                .range(['white', 'steelblue'])
                .interpolate(d3.interpolateLab);

            $scope.initSlider = function () {
                var binSizeChange = function () {
                    $scope.binSize = slider.getValue();
                    $scope.$apply();
                };

                var slider = $('#binSize').slider()
                    .slider('setValue', $scope.binSize)
                    .on('slideStop', binSizeChange)
                    .data('slider');
            };

            $scope.initLegend = function () {
                var margin = {top: 5, right: 20, bottom: 15, left: 5},
                    width = $('#legend').width(),
                    height = 45;

                var idGradient = 'legendGradient';

                var svgForLegendStuff = d3.select('#legend').append('svg')
                    .attr('width', '100%')
                    .attr('height', height);

                //create the empty gradient that we're going to populate later
                svgForLegendStuff.append('g')
                    .append('defs')
                    .append('linearGradient')
                    .attr('id', idGradient)
                    .attr('x1', '0%')
                    .attr('x2', '100%')
                    .attr('y1', '0%')
                    .attr('y2', '0%');
                // x1=0, x2=100%, y1=y2 results in a horizontal gradient
                // it would have been vertical if x1=x2, y1=0, y2=100%
                // See
                //      http://www.w3.org/TR/SVG/pservers.html#LinearGradients
                // for more details and fancier things you can do
                //create the bar for the legend to go into
                // the 'fill' attribute hooks the gradient up to this rect
                svgForLegendStuff.append('rect')
                    .attr('fill', 'url(#' + idGradient + ')')
                    .attr('x', margin.left)
                    .attr('y', margin.top)
                    .attr('width', width - margin.left - margin.right)
                    .attr('height', height - margin.top - margin.bottom)
                    .style('stroke', 'black')
                    .style('stroke-width', '1px');

                //add text on either side of the bar
                svgForLegendStuff.append('text')
                    .attr('class', 'legendText')
                    .attr('text-anchor', 'middle')
                    .attr('x', margin.left)
                    .attr('y', height)
                    .text('0');

                svgForLegendStuff.append('text')
                    .attr('class', 'legendText')
                    .attr('text-anchor', 'middle')
                    .attr('x', width - margin.right)
                    .attr('y', height)
                    .text(numberHues + '+');

                //now the d3 magic (imo) ...
                var stops = d3.select('#' + idGradient).selectAll('stop')
                    .data(d3.range(numberHues).map(function (i) {
                        return {
                            percent: i / numberHues,
                            color: color(i)
                        };
                    }));

                stops.enter().append('stop');
                stops.attr('offset', function (d) {
                    return d.percent;
                })
                    .attr('stop-color', function (d) {
                        return d.color;
                    });
            };

            $scope.initHexbin = function () {
                var margin = {top: 20, right: 20, bottom: 40, left: 50},
                    width = $('#hexbin').width() - margin.left - margin.right,
                    height = 500 - margin.top - margin.bottom;

                var points = []; //dataFactory.points(0, 0);

                var tot = function (d) {
                    return d.reduce(function (acc, cur) {
                        return acc + cur[2];
                    }, 0);
                };

                var hexbin = d3.hexbin()
                    .x(function (d) {
                        return x(d[0]);
                    })
                    .y(function (d) {
                        return y(d[1]);
                    })
                    .size([width, height])
                    .radius($scope.binSize);

                var x = d3.scale.linear()
                    .range([0, width]);

                var y = d3.scale.linear()
                    .range([height, 0]);

                var xAxis = d3.svg.axis()
                    .scale(x)
                    .orient('bottom')
                    .tickSize(6, -height);

                var yAxis = d3.svg.axis()
                    .scale(y)
                    .orient('left')
                    .tickSize(6, -width);

                var zoomed = function () {
                    svg.select(".x.axis").call(xAxis);
                    svg.select(".y.axis").call(yAxis);
                    redraw();
                }

                var zoom = d3.behavior.zoom()
                    .x(x)
                    .y(y)
                    .on("zoom", zoomed);

                var tip = d3.tip()
                    .attr('class', 'd3-tip')
                    .offset([-10, 0])
                    .html(function (d) {
                        var agg = d.reduce(function (acc, cur) {
                            return [acc[0] + cur[0] * cur[2] , acc[1] + cur[1] * cur[2], acc[2] + cur[2]];
                        }, [0, 0, 0]);

                        var x = d3.format('.2f')(agg[0] / agg[2]);
                        var y = d3.format('.2f')(agg[1] / agg[2]);

                        return '<span>(' + x + ',' + y + '): ' + agg[2] + '</span>';
                    });

                var svg = d3.select('#hexbin').append('svg')
                    .attr('width', width + margin.left + margin.right)
                    .attr('height', height + margin.top + margin.bottom)
                    .append('g')
                    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

                svg.append("rect")
                    .attr("class", "pane")
                    .attr("width", width)
                    .attr("height", height)
                    .call(zoom);

                svg.append('clipPath')
                    .attr('id', 'clip')
                    .append('rect')
                    .attr('class', 'mesh')
                    .attr('width', width)
                    .attr('height', height);

                svg.call(tip);

                var hexagon = svg.append('g')
                    .attr('clip-path', 'url(#clip)')
                    .selectAll('.hexagon');

                svg.append('g')
                    .attr('class', 'y axis')
                    .call(yAxis);

                svg.append('g')
                    .attr('class', 'x axis')
                    .attr('transform', 'translate(0,' + height + ')')
                    .call(xAxis);

                var xLab = svg.append('text')
                    .attr('class', 'x label')
                    .attr('text-anchor', 'middle')
                    .attr('x', width / 2)
                    .attr('y', height + 30);

                var yLab = svg.append('text')
                    .attr('class', 'y label')
                    .attr('text-anchor', 'middle')
                    .attr('x', -height / 2)
                    .attr('y', -40)
                    .attr('transform', 'rotate(-90)');

                var redraw = function () {
                    hexagon = hexagon.data(hexbin(points), function (d) {
                        return d.i + ',' + d.j;
                    });

                    hexagon.exit().remove();

                    hexagon.enter().append('path')
                        .attr('class', 'hexagon')
                        .on('mouseover', tip.show)
                        .on('mouseout', tip.hide);
                        //.call(zoom);

                    //TODO: Is redrawing every hexagon a significant performance hit when binSize doesn't change?
                    //We can potentially avoid this if we can embed radius in data key properly
                    hexagon
                        .attr('transform', function (d) {
                            return 'translate(' + d.x + ',' + d.y + ')';
                        })
                        .attr('d', hexbin.hexagon())
                        .style('fill', function (d) {
                            return color(tot(d));
                        });
                };

                var redrawAxis = function (traits) {
                    x.domain(d3.extent(points, function (d) {
                        return d[0];
                    }));
                    y.domain(d3.extent(points, function (d) {
                        return d[1];
                    }));
                    zoom = zoom.x(x).y(y);

                    var t = svg.transition().duration(500);
                    t.select('.x.axis').call(xAxis);
                    t.select('.x.label').text(traits[0]);

                    t.select('.y.axis').call(yAxis);
                    t.select('.y.label').text(traits[1]);
                };

                $scope.$onRootScope('hexbinChanged', function () {
                    points = $rootScope.selectedHexbins;
                    redrawAxis($rootScope.selectedTraits);
                    redraw();
                });

                $scope.$watch('binSize', function () {
                    hexbin = hexbin.radius($scope.binSize);

                    redraw();
                })
            };
        }]);