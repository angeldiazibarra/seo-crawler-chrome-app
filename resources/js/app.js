!function(){"use strict";var app=angular.module("myCrawler",[]);app.factory("getRobots",function($http,getSitemap){return{getRobotsData:function(url){$http.get(url).success(function(data){var robotsArray=data.match(/[^\r\n]+/g);web.robotsurl=url,web.robotstxt=robotsArray;for(var i in robotsArray)if(robotsArray[i].match(/sitemap:/i)){var sitemap=robotsArray[i].replace(/sitemap\:/i,"").trim();web.sitemaps.push(sitemap),getSitemap.getSitemapData(sitemap)}}).error(function(){web.robotsurl=null,web.robotstxt=null})}}}),app.factory("getSitemap",function($http){return{getSitemapData:function(url){$http.get(url).success(function(data){var urlsArray1=data.match(/(\<loc\>)([a-z0-9:\/\-\.\?\=\#])*(\<\/loc\>)/gi),urlsArray2=data.match(/(\<link\>)([a-z0-9:\/\-\.\?\=\#])*(\<\/link\>)/gi);for(var i in urlsArray1){var item=urlsArray1[i].trim(),unit=item.replace(/\<\/?loc\>/gi,"").trim();web.urls.push(unit)}for(var i in urlsArray2){var item=urlsArray2[i].trim(),unit=item.replace(/\<\/?link\>/gi,"").trim();web.urls.push(unit)}})}}}),app.controller("CrawlerController",function($scope,getRobots){this.website=web,$scope.CheckUrl=function(){var checkUrl=web.hostname;checkUrl.match(/^(http:\/\/)/i)&&(web.protocol="http://",checkUrl=checkUrl.replace(/^(http:\/\/)/i,"")),checkUrl.match(/^(https:\/\/)/i)&&(web.protocol="https://",checkUrl=checkUrl.replace(/^(https:\/\/)/i,"")),web.hostname=checkUrl,web.invalidurl=checkUrl.match(/^(https?:\/\/)?([a-z0-9]+\.*-*)+(\.[a-z]{2,6})$/i)?!1:!0},$scope.SelectProtocol=function(protocol){web.protocol=protocol},$scope.ShowRobots=function(){return null===web.robotsurl?"false":"true"},$scope.ShowSitemaps=function(){return web.sitemaps=$scope.ArrayUnique(web.sitemaps),0===web.sitemaps.length?"false":"true"},$scope.ArrayUnique=function(a){return a.reduce(function(p,c){return p.indexOf(c)<0&&p.push(c),p},[])},$scope.CodeComment=function(line){return line.indexOf("#")>-1?"codecomment":void 0},$scope.DoCrawl=function(){web.urls=[],web.sitemaps=[];var robotsUrl=(web.protocol+web.hostname,web.protocol+web.hostname+"/robots.txt"),sitemapUrl=web.protocol+web.hostname+"/sitemap.xml";getRobots.getRobotsData(robotsUrl),web.sitemaps.push(sitemapUrl)}});var web={hostname:null,protocol:"http://",invalidurl:!0,robotsurl:null,robotstxt:null,sitemaps:[],urls:[]}}();