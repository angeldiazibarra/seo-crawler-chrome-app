!function(){"use strict";var app=angular.module("myCrawler",[]);app.factory("urlData",function($http,$q){return{getData:function(url){var deferred=$q.defer();return $http.get(url).success(function(data){deferred.resolve(data)}).error(function(data,status){deferred.reject(status)}),deferred.promise}}}),app.controller("CrawlerController",function($scope,urlData){this.website=web,$scope.CheckUrl=function(){var checkUrl=web.hostname;checkUrl.match(/^(http:\/\/)/i)&&(web.protocol="http://",checkUrl=checkUrl.replace(/^(http:\/\/)/i,"")),checkUrl.match(/^(https:\/\/)/i)&&(web.protocol="https://",checkUrl=checkUrl.replace(/^(https:\/\/)/i,"")),web.hostname=checkUrl,web.invalidurl=checkUrl.match(/^(https?:\/\/)?([a-z0-9]+\.*-*)+(\.[a-z]{2,6})$/i)?!1:!0},$scope.SelectProtocol=function(protocol){web.protocol=protocol},$scope.ShowRobots=function(){return null===web.robotsurl?"false":"true"},$scope.ShowSitemaps=function(){return web.sitemaps=$scope.ArrayUnique(web.sitemaps),0===web.sitemaps.length?"false":"true"},$scope.ArrayUnique=function(a){return a.reduce(function(p,c){return p.indexOf(c)<0&&p.push(c),p},[])},$scope.CodeComment=function(line){return line.indexOf("#")>-1?"codecomment":void 0},$scope.parseRobots=function(data){var robotsArray=data.match(/[^\r\n]+/g);web.robotstxt=robotsArray;for(var i in robotsArray)if(robotsArray[i].match(/sitemap:/i)){var sitemap=robotsArray[i].replace(/sitemap\:/i,"").trim();-1===web.sitemaps.indexOf(sitemap)&&web.sitemaps.push(sitemap)}},$scope.parseSitemap=function(data){var urlsArray1=data.match(/(\<loc\>)([a-z0-9:\/\-\.\?\=\#\_])*(\<\/loc\>)/gi),urlsArray2=data.match(/(\<link\>)([a-z0-9:\/\-\.\?\=\#\_])*(\<\/link\>)/gi);for(var i in urlsArray1){var item=urlsArray1[i].trim(),unit=item.replace(/\<\/?loc\>/gi,"").trim();unit.match(/(\.xml)$/i)?(web.sitemaps.push(unit),-1===web.sitemaps.indexOf(unit)&&web.sitemaps.push(unit)):-1===web.urls.indexOf(unit)&&web.urls.push(unit)}for(var i in urlsArray2){var item=urlsArray2[i].trim(),unit=item.replace(/\<\/?link\>/gi,"").trim();-1===web.urls.indexOf(unit)&&web.urls.push(unit)}},$scope.DoCrawl=function(){web.urls=[],web.sitemaps=[];var url=web.protocol+web.hostname,robotsUrl=web.protocol+web.hostname+"/robots.txt",sitemapUrl=web.protocol+web.hostname+"/sitemap.xml";web.sitemaps.push(sitemapUrl),urlData.getData(robotsUrl).then(function(data){web.robotsurl=url,$scope.parseRobots(data)}).then(function(){for(var i in web.sitemaps)urlData.getData(web.sitemaps[i]).then(function(data){$scope.parseSitemap(data);for(var j in web.sitemaps)urlData.getData(web.sitemaps[j]).then(function(data){$scope.parseSitemap(data)})})}).then(function(){})},$scope.$watch("web",function(){console.log(web.sitemaps)},!0)});var web={hostname:null,protocol:"http://",invalidurl:!0,robotsurl:null,robotstxt:null,sitemaps:[],urls:[]}}();