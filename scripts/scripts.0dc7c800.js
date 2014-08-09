!function(){"use strict";String.prototype.width||(String.prototype.width=function(a,b){var c,d,e;return"undefined"==typeof b&&(b={}),c="object"==typeof a?a.css("font-size")+" "+a.css("font-family"):a||"12px arial",d=String.prototype.width.persisted||$('<div id="dailyjs-stringWidth" />').css({position:"absolute","float":"left",visibility:"hidden",font:c}).appendTo($("body")),$("#dailyjs-stringWidth").html("<span>"+this+"</span>"),e=d.width(),String.prototype.width.persisted||b.persist?String.prototype.width.persisted=d:d.remove(),e})}(),angular.module("heatmapApp",["ngAnimate","ngCookies","ngResource","ngRoute","ngSanitize","ngTouch","ngTable","angular-d3-hexbin","ui.bootstrap"]).config(["$provide",function(a){a.decorator("$rootScope",["$delegate",function(a){return Object.defineProperty(a.constructor.prototype,"$onRootScope",{value:function(b,c){var d=a.$on(b,c);return this.$on("$destroy",d),d},enumerable:!1}),a}])}]),angular.module("heatmapApp").factory("dataFactory",["$http",function(a){var b={};return b.fetch=function(b){return a.get("assets/"+b).then(function(a){return a.data})},b.getPearsonsCorrelation=function(a,b,c){var d=0,e=0,f=0,g=0,h=0;a.forEach(function(a){var i=b(a),j=c(a);isFinite(i)&&isFinite(j)&&(d+=i,e+=j,f+=i*j,g+=i*i,h+=j*j)});var i=a.length*f-d*e,j=a.length*g-d*d,k=a.length*h-e*e,l=Math.sqrt(j*k),m=i/l;return m},b}]),angular.module("heatmapApp").controller("MainCtrl",["$scope",function(){}]),angular.module("heatmapApp").controller("hexbinCtrl",["$rootScope","$scope",function(a,b){b.binSize=3,b.points=[],b.labs=["",""];var c=function(a){return Math.abs(a)>=1e3?d3.format("2.2s")(a):Math.abs(a)>1?d3.format(".1f")(a):Math.abs(a)>=.01?d3.format(".2f")(a):0===Math.abs(a)?"0":d3.format(".2e")(a)};b.numericFormat=[c,c],b.initSlider=function(){var a=function(){b.binSize=c.getValue(),b.$apply()},c=$("#binSize").slider({formater:d3.format(".1f")}).slider("setValue",b.binSize).on("slideStop",a).data("slider")},b.wtCount=function(a){return a.reduce(function(a,b){return a+b[2]},0)},b.color=d3.scale.linear().domain([0,20]).range(["white","steelblue"]).interpolate(d3.interpolateLab),b.tip=function(a){var b=a.reduce(function(a,b){return[a[0]+b[0]*b[2],a[1]+b[1]*b[2],a[2]+b[2]]},[0,0,0]),c=d3.format(".2f")(b[0]/b[2]),d=d3.format(".2f")(b[1]/b[2]);return"<span>("+c+","+d+"): "+b[2]+"</span>"},b.showHistogram=!1,b.$onRootScope("hexbinChanged",function(){b.showHistogram=!1,b.points=a.selectedHexbins,b.labs=a.selectedVars}),b.initHistogram=function(){var c=[],d=[],e=d3.format(",.0f"),f={top:10,right:30,bottom:30,left:30},g=$("#hexbin").width(),h=g-f.left-f.right,i=g-f.top-f.bottom,j=d3.scale.linear().domain([0,1]).range([0,h]),k=d3.scale.linear().domain([0,d3.max(d,function(a){return a.y})]).range([i,0]),l=d3.svg.axis().scale(j).orient("bottom"),m=d3.select("#histogram").append("svg").attr("width",h+f.left+f.right).attr("height",i+f.top+f.bottom).append("g").attr("transform","translate("+f.left+","+f.top+")"),n=m.selectAll(".bar");m.append("g").attr("class","x axis").attr("transform","translate(0,"+i+")").call(l);var o=function(){c=c.map(function(a){return a[0]}),j=j.domain(d3.extent(c)),m.select(".x.axis").call(l);var a=d3.layout.histogram().bins(j.ticks(20))(c);k=k.domain([0,d3.max(a,function(a){return a.y})]),n=n.data(a),n.exit().remove();var b=n.enter().append("g").attr("class","bar");b.append("rect").attr("x",1),b.append("text").attr("dy",".75em").attr("y",6),n.attr("transform",function(a){return"translate("+j(a.x)+","+k(a.y)+")"}),n.select("rect").attr("width",j(a[0].dx+j.domain()[0])-1).attr("height",function(a){return i-k(a.y)}),n.select("text").attr("x",j(a[0].dx+j.domain()[0])/2).attr("text-anchor","middle").text(function(a){return e(a.y)})};b.$onRootScope("histogramChanged",function(){b.showHistogram=!0,c=a.selectedValues,o()})}}]),angular.module("heatmapApp").controller("correlationCtrl",["$rootScope","$scope","dataFactory","ngTableParams","$window",function(a,b,c,d,e){b.style={rotate:!1,row:{},rowHead:{"text-align":"right"},colHead:{},table:{},rotateDiv:{},rotateSpan:{}};var f=!0,g=function(){var a=d3.max(b.vars.map(function(a){return a.width()}));b.style.rowHead.width=a+"px";var c=($("#correlation").parent().width()-a)/b.vars.length;b.style.colHead.width=c+"px",b.style.row.height=c+"px",f=c>32;var d=12>c?c:12,e=d,g=a>c;if(g&&d===c&&(e*=Math.sin(Math.PI/4)),b.style.table["font-size"]=d+"px",b.style.rotateSpan["font-size"]=e+"px",g){var h=a*e/12,i=h*Math.sin(Math.PI/4),j=i+e*Math.cos(Math.PI/4)*2;b.style.colHead.height=j+"px",b.style.rotateDiv.left=j/2,b.style.rotateSpan.left=(e-h)/2,b.style.rotateSpan.bottom=i/2,b.style.rotateSpan.width=h}else b.style.colHead.height=e;b.style.rotate=g};angular.element(e).bind("resize",function(){return g(),b.$apply()}),b.vars=[];var h=[];b.correlations=[];var i=function(a){h=d3.csv.parse(a),b.vars=Object.keys(h[0]);var d=[];b.vars.forEach(function(a,e){var f={name:a,values:{}},g=function(b){return+b[a]};b.vars.forEach(function(b,i){var j=0/0;if(e===i)h.map(g).filter(isFinite).length&&(j=1);else if(i>e){var k=function(a){return+a[b]};j=c.getPearsonsCorrelation(h,g,k)}else j=d[i].values[a];f.values[b]=j}),d.push(f)}),b.correlations=d,b.tableParams.reload(),g()};b.dataset="iris.csv",b.$watch("dataset",function(a){c.fetch(a).then(i)});var j=new FileReader;j.onload=function(){i(j.result)},b.uploadFile=function(a){j.readAsText(a[0])},b.updateSelection=function(b,c){if(isFinite(b.values[c])){var d=b.name;d===c?(a.selectedVar=d,a.selectedValues=h.map(function(a){return[+a[d],1]}),a.$emit("histogramChanged")):(a.selectedVars=[d,c],a.selectedHexbins=h.map(function(a){return[+a[d],+a[c],1]}).filter(function(a){return isFinite(a[0])&&isFinite(a[1])}),a.$emit("hexbinChanged"))}},b.format=d3.format("%.2f"),b.isFinite=isFinite,b.tooltip=function(a,c){if(a.name===c)return c;var d=a.name+" vs. "+c,e=a.values[c];return!f&&isFinite(e)&&(d+="<br/>"+b.format(e)),d},b.showVal=function(a,b){return f&&a.name!==b&&isFinite(a.values[b])},b.colorScale=d3.scale.linear().domain(d3.range(-1,1,.2)).range(colorbrewer.RdYlGn[11]).interpolate(d3.interpolateLab),b.color=function(a,c){return isNaN(a.values[c])?"white":b.colorScale(a.values[c])},b.tableParams=new d({page:1,count:b.vars.length},{counts:[],total:b.vars.length,getData:function(a){a.resolve(b.correlations)}})}]);