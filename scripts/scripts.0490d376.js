"use strict";angular.module("heatmapApp",["ngAnimate","ngCookies","ngResource","ngRoute","ngSanitize","ngTouch","ngTable"]).config(["$provide",function(a){a.decorator("$rootScope",["$delegate",function(a){return Object.defineProperty(a.constructor.prototype,"$onRootScope",{value:function(b,c){var d=a.$on(b,c);return this.$on("$destroy",d),d},enumerable:!1}),a}])}]),String.prototype.width||(String.prototype.width=function(a,b){var c,d,e;return"undefined"==typeof b&&(b={}),c="object"==typeof a?a.css("font-size")+" "+a.css("font-family"):a||"12px arial",d=String.prototype.width.persisted||$('<div id="dailyjs-stringWidth" />').css({position:"absolute","float":"left",visibility:"hidden",font:c}).appendTo($("body")),$("#dailyjs-stringWidth").html("<span>"+this+"</span>"),e=d.width(),String.prototype.width.persisted||b.persist?String.prototype.width.persisted=d:d.remove(),e}),angular.module("heatmapApp").factory("dataFactory",["$http",function(a){var b={};return b.fetch=function(b){return a.get("assets/"+b+".csv").then(function(a){return a.data})},b.getPearsonsCorrelation=function(a,b){var c=0;a.length==b.length?c=a.length:a.length>b.length?(c=b.length,console.error("x has more items in it, the last "+(a.length-c)+" item(s) will be ignored")):(c=a.length,console.error("y has more items in it, the last "+(b.length-c)+" item(s) will be ignored"));for(var d=[],e=[],f=[],g=0;c>g;g++)d.push(a[g]*b[g]),e.push(a[g]*a[g]),f.push(b[g]*b[g]);for(var h=0,i=0,j=0,k=0,l=0,g=0;c>g;g++)h+=a[g],i+=b[g],j+=d[g],k+=e[g],l+=f[g];var m=c*j-h*i,n=c*k-h*h,o=c*l-i*i,p=Math.sqrt(n*o),q=m/p;return q},b}]),angular.module("heatmapApp").controller("MainCtrl",["$scope",function(){}]),angular.module("heatmapApp").controller("hexbinCtrl",["$rootScope","$scope",function(a,b){b.binSize=10;var c=20,d=d3.scale.linear().domain([0,c]).range(["white","steelblue"]).interpolate(d3.interpolateLab);b.initSlider=function(){var a=function(){b.binSize=c.getValue(),b.$apply()},c=$("#binSize").slider().slider("setValue",b.binSize).on("slideStop",a).data("slider")};var e;b.initLegend=function(){var a={top:5,right:20,bottom:15,left:5},b=$("#legend").width(),f=35,g="legendGradient",h=d3.select("#legend").append("svg").attr("width","100%").attr("height",f);h.append("g").append("defs").append("linearGradient").attr("id",g).attr("x1","0%").attr("x2","100%").attr("y1","0%").attr("y2","0%"),h.append("rect").attr("fill","url(#"+g+")").attr("x",a.left).attr("y",a.top).attr("width",b-a.left-a.right).attr("height",f-a.top-a.bottom).style("stroke","black").style("stroke-width","0.5px"),h.append("text").attr("class","legendText").attr("text-anchor","middle").attr("x",a.left).attr("y",f).text("0"),e=h.append("text").attr("class","legendText").attr("text-anchor","middle").attr("x",b-a.right).attr("y",f);var i=d3.select("#"+g).selectAll("stop").data(d3.range(c).map(function(a){return{percent:a/c,color:d(a)}}));i.enter().append("stop"),i.attr("offset",function(a){return a.percent}).attr("stop-color",function(a){return a.color})},b.initHexbin=function(){var c={top:10,right:20,bottom:60,left:50},f=$("#hexbin").width()-c.left-c.right,g=$("#hexbin").width()-c.top-c.bottom,h=[],i=d3.hexbin().x(function(a){return j(a[0])}).y(function(a){return k(a[1])}).size([f,g]).radius(b.binSize),j=d3.scale.linear().range([0,f]),k=d3.scale.linear().range([g,0]),l=d3.svg.axis().scale(j).orient("bottom").tickSize(6,-g),m=d3.svg.axis().scale(k).orient("left").tickSize(6,-f),n=function(a){var b=a.reduce(function(a,b){return[a[0]+b[0]*b[2],a[1]+b[1]*b[2],a[2]+b[2]]},[0,0,0]),c=d3.format(".2f")(b[0]/b[2]),d=d3.format(".2f")(b[1]/b[2]);return"<span>("+c+","+d+"): "+b[2]+"</span>"},o=function(){s.attr("transform","translate("+d3.event.translate+")scale("+d3.event.scale+")"),r.select(".x.axis").call(l),r.select(".y.axis").call(m)},p=d3.behavior.zoom().scaleExtent([1,1/0]).x(j).y(k).on("zoom",o),q=d3.select("#hexbin").append("div").attr("class","d3tip hidden"),r=d3.select("#hexbin").append("svg").attr("width",f+c.left+c.right).attr("height",g+c.top+c.bottom).append("g").attr("transform","translate("+c.left+","+c.top+")").call(p);r.append("rect").attr("class","pane").attr("width",f).attr("height",g);var s=r.append("svg").attr("width",f).attr("height",g).append("g"),t=s.selectAll(".hexagon");r.append("g").attr("class","y axis").call(m),r.append("g").attr("class","x axis").attr("transform","translate(0,"+g+")").call(l);var u=(r.append("text").attr("class","x label").attr("text-anchor","middle").attr("x",f/2).attr("y",g+30),r.append("text").attr("class","y label").attr("text-anchor","middle").attr("x",-g/2).attr("y",-40).attr("transform","rotate(-90)"),function(){var a=i(h);if(a.length){var b=0;a.forEach(function(a){var c=a.reduce(function(a,b){return a+b[2]},0);c>b&&(b=c),a.total=c}),d=d.domain([0,b]),e.text(b)}t=t.data(a,function(a){return a.i+","+a.j}),t.exit().remove(),t.enter().append("path").attr("class","hexagon"),t.on("mousemove",function(a){var b=d3.mouse(r.node()).map(function(a){return parseInt(a)});q.classed("hidden",!1).attr("style","left:"+(b[0]+25)+"px;top:"+(b[1]-30)+"px").html(n(a))}).on("mouseout",function(){q.classed("hidden",!0)}),t.attr("transform",function(a){return"translate("+a.x+","+a.y+")"}).attr("d",i.hexagon()).style("fill",function(a){return d(a.total)})}),v=function(a){j.domain(d3.extent(h,function(a){return a[0]})),k.domain(d3.extent(h,function(a){return a[1]})),p=p.x(j).y(k),s.attr("transform",null);var b=r.transition().duration(500);b.select(".x.axis").call(l),b.select(".x.label").text(a[0]),b.select(".y.axis").call(m),b.select(".y.label").text(a[1])};b.$onRootScope("hexbinChanged",function(){h=a.selectedHexbins,v(a.selectedVars),u()}),b.$watch("binSize",function(){i=i.radius(b.binSize),u()})}}]),angular.module("heatmapApp").controller("correlationCtrl",["$rootScope","$scope","dataFactory","ngTableParams","$window",function(a,b,c,d,e){b.corCol={},b.corRow={};var f=function(){var a=$("#correlation").width()/(b.vars.length+1);b.corCol={width:a+"px"},b.corRow={height:a+"px"}};angular.element(e).bind("resize",function(){return f(),b.$apply()}),b.vars=[];var g=[];b.correlations=[];var h=function(a){g=d3.csv.parse(a),b.vars=Object.keys(g[0]);var d=[];b.vars.forEach(function(a){var e={"var":a},f=g.map(function(b){return+b[a]});b.vars.forEach(function(a){var b=g.map(function(b){return+b[a]});e[a]=c.getPearsonsCorrelation(f,b)}),d.push(e)}),b.correlations=d,b.tableParams.reload(),f()};b.dataset="iris",b.$watch("dataset",function(a){c.fetch(a).then(h)});var i=new FileReader;i.onload=function(){h(i.result)},b.uploadFile=function(a){i.readAsText(a[0])},b.updateHexbin=function(b,c){if(isFinite(b[c])){var d=b.var;a.selectedVars=[d,c],a.selectedHexbins=g.map(function(a){return[+a[d],+a[c],1]}),a.$emit("hexbinChanged")}},b.format=d3.format("%.2f"),b.isFinite=isFinite;var j=d3.scale.linear().domain(d3.range(-1,1,.2)).range(colorbrewer.RdYlGn[11]).interpolate(d3.interpolateLab);b.color=function(a,b){return a.var===b||isNaN(a[b])?"white":j(a[b])},b.tableParams=new d({page:1,count:b.vars.length},{counts:[],total:b.vars.length,getData:function(a){a.resolve(b.correlations)}})}]);