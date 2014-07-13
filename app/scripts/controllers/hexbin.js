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
            $scope.binSize = 10;

            var numberHues = 20;
            var color = d3.scale.linear()
                .domain([0, numberHues])
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

            //Source: http://bl.ocks.org/nowherenearithaca/4449376
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

                var points = [];

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

                var tip = function (d) {
                    var agg = d.reduce(function (acc, cur) {
                        return [acc[0] + cur[0] * cur[2] , acc[1] + cur[1] * cur[2], acc[2] + cur[2]];
                    }, [0, 0, 0]);

                    var x = d3.format('.2f')(agg[0] / agg[2]);
                    var y = d3.format('.2f')(agg[1] / agg[2]);

                    return '<span>(' + x + ',' + y + '): ' + agg[2] + '</span>';
                };

                var zoomed = function () {
                    //console.log(zoom.scale() + ',' + zoom.center() + ',' + zoom.translate());
                    //console.log(d3.event.scale + ',' + d3.event.translate);
                    container.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
                    svg.select(".x.axis").call(xAxis);
                    svg.select(".y.axis").call(yAxis);

                    //hexbin = hexbin.radius($scope.binSize * zoom.scale());
                    //redraw();
                }

                var zoom = d3.behavior.zoom()
                    .scaleExtent([1, Infinity])
                    .x(x)
                    .y(y)
                    .on("zoom.in", function() {
                        //console.log(d3.event.translate + d3.event.scale)
                        //circle.attr("transform", "translate(" + d3.event.translate + ") scale(" + d3.event.scale + ")");
                    })
                    .on("zoom", zoomed);

                var drag = d3.behavior.drag()
                    .origin(function(d) { return d; })
                    .on("dragstart", function(d) { d3.event.sourceEvent.stopPropagation(); });

                var tooltip = d3.select("#hexbin").append("div")
                    .attr("class", "d3tip hidden");

                var svg = d3.select('#hexbin').append('svg')
                    .attr('width', width + margin.left + margin.right)
                    .attr('height', height + margin.top + margin.bottom)
                    .append('g')
                    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
                    .call(zoom); //TODO: Avoid zoom on Axis

                //Add rect so zoom can be activated in empty space
                svg.append("rect")
                    .attr("class", "pane")
                    .attr("width", width)
                    .attr("height", height);

                //Use svg to clip to support drag without redraw
                var container = svg.append("svg")
                    .attr("width", width)
                    .attr("height", height)
                    .append('g');

                var hexagon = container
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
                        .attr('class', 'hexagon');

                    hexagon
                        .on("mousemove", function (d, i) {
                            var mouse = d3.mouse(svg.node()).map(function (d) {
                                return parseInt(d);
                            });

                            tooltip
                                .classed("hidden", false)
                                .attr("style", "left:" + (mouse[0] + 25) + "px;top:" + (mouse[1] - 20) + "px")
                                .html(tip(d))
                        })
                        .on("mouseout", function (d, i) {
                            tooltip.classed("hidden", true)
                        });

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
                    container.attr("transform", null);

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