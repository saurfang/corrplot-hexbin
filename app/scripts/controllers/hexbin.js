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
            $scope.showHistogram = false;

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

            var maxHue;
            //Source: http://bl.ocks.org/nowherenearithaca/4449376
            $scope.initLegend = function () {
                var margin = {top: 5, right: 20, bottom: 15, left: 5},
                    width = $('#legend').width(),
                    height = 35;

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
                    .style('stroke-width', '0.5px');

                //add text on either side of the bar
                svgForLegendStuff.append('text')
                    .attr('class', 'legendText')
                    .attr('text-anchor', 'middle')
                    .attr('x', margin.left)
                    .attr('y', height)
                    .text('0');

                maxHue = svgForLegendStuff.append('text')
                    .attr('class', 'legendText')
                    .attr('text-anchor', 'middle')
                    .attr('x', width - margin.right)
                    .attr('y', height);

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
                var margin = {top: 10, right: 20, bottom: 60, left: 50},
                    width = $('#hexbin').width() - margin.left - margin.right,
                    height = $('#hexbin').width() - margin.top - margin.bottom,
                    points = [];

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
                    container.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
                    svg.select(".x.axis").call(xAxis);
                    svg.select(".y.axis").call(yAxis);
                }

                var zoom = d3.behavior.zoom()
                    .scaleExtent([1, Infinity])
                    .x(x)
                    .y(y)
                    .on("zoom", zoomed);

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

                //Use svg to clip to support pan without redraw
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
                    var bins = hexbin(points);
                    if(bins.length){
                        var maxCount = 0;
                        bins.forEach(function (d){
                            var count = d.reduce(function (acc, cur) {
                                return acc + cur[2];
                            }, 0);
                            if(count > maxCount){
                                maxCount = count;
                            }
                            d.total = count;
                        });
                        color = color.domain([0, maxCount]);
                        maxHue.text(maxCount);
                    }
                    hexagon = hexagon.data(bins, function (d) {
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
                                .attr("style", "left:" + (mouse[0] + 25) + "px;top:" + (mouse[1] - 30) + "px")
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
                            return color(d.total);
                        });
                };

                var redrawAxis = function (vars) {
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
                    t.select('.x.label').text(vars[0]);

                    t.select('.y.axis').call(yAxis);
                    t.select('.y.label').text(vars[1]);
                };

                $scope.$onRootScope('hexbinChanged', function () {
                    $scope.showHistogram = false;
                    points = $rootScope.selectedHexbins;
                    redrawAxis($rootScope.selectedVars);
                    redraw();
                });

                $scope.$watch('binSize', function () {
                    hexbin = hexbin.radius($scope.binSize);
                    redraw();
                })
            };

            $scope.initHistogram = function() {
                var values = [], data = [];
                // A formatter for counts.
                var formatCount = d3.format(",.0f");

                var margin = {top: 10, right: 30, bottom: 30, left: 30},
                    width = $('#hexbin').width() - margin.left - margin.right,
                    height = $('#hexbin').width() - margin.top - margin.bottom;

                var x = d3.scale.linear()
                    .domain([0, 1])
                    .range([0, width]);

                var y = d3.scale.linear()
                    .domain([0, d3.max(data, function(d) { return d.y; })])
                    .range([height, 0]);

                var xAxis = d3.svg.axis()
                    .scale(x)
                    .orient("bottom");

                var svg = d3.select("#histogram").append("svg")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                    .append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

                var bar = svg.selectAll(".bar");

                svg.append("g")
                    .attr("class", "x axis")
                    .attr("transform", "translate(0," + height + ")")
                    .call(xAxis);

                var redraw = function(){
                    values = values.map(function(d){return d[0];})
                    x = x.domain(d3.extent(values));
                    svg.select('.x.axis').call(xAxis);
                    var data = d3.layout.histogram()
                        .bins(x.ticks(20))(values);

                    y = y.domain([0, d3.max(data, function(d) { return d.y; })])

                    bar = bar.data(data);

                    bar.exit().remove();

                    var newBar = bar.enter().append("g")
                        .attr("class", "bar");
                    newBar.append("rect")
                        .attr("x", 1);
                    newBar.append("text")
                        .attr("dy", ".75em")
                        .attr("y", 6);

                    bar.attr("transform", function(d) { return "translate(" + x(d.x) + "," + y(d.y) + ")"; });

                    bar.select('rect')
                        .attr("width", x(data[0].dx + x.domain()[0]) - 1)
                        .attr("height", function(d) { return height - y(d.y); });

                    bar.select('text')
                        .attr("x", x(data[0].dx + x.domain()[0]) / 2)
                        .attr("text-anchor", "middle")
                        .text(function(d) { return formatCount(d.y); });
                };

                $scope.$onRootScope('histogramChanged', function () {
                    $scope.showHistogram = true;
                    values = $rootScope.selectedValues;
                    //redrawAxis($rootScope.selectedVar);
                    redraw();
                });
            };
        }]);