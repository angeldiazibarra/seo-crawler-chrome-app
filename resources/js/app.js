!function(){"use strict";var app=angular.module("myCrawler",[]);app.factory("getUrl",function($http){return{getUrlData:function(url){$http.get(url).success(function(data){var robotsArray=data.match(/[^\r\n]+/g);web.robotsurl=url,web.robotstxt=robotsArray,console.log(web.robotstxt)}).error(function(){web.robotsurl=null,web.robotstxt=null})}}}),app.controller("CrawlerController",function($scope,getUrl){this.website=web,$scope.CheckUrl=function(){var checkUrl=web.hostname;checkUrl.match(/^(http:\/\/)/i)&&(web.protocol="http://",checkUrl=checkUrl.replace(/^(http:\/\/)/i,"")),checkUrl.match(/^(https:\/\/)/i)&&(web.protocol="https://",checkUrl=checkUrl.replace(/^(https:\/\/)/i,"")),web.hostname=checkUrl,web.invalidurl=checkUrl.match(/^(https?:\/\/)?([a-z0-9]+\.*-*)+(\.[a-z]{2,6})$/i)?!1:!0},$scope.SelectProtocol=function(protocol){web.protocol=protocol},$scope.ShowRobots=function(){return null===web.robotsurl?"false":"true"},$scope.CodeComment=function(line){return line.indexOf("#")>-1?"codecomment":void 0},$scope.DoCrawl=function(){var robotsUrl=(web.protocol+web.hostname,web.protocol+web.hostname+"/robots.txt");getUrl.getUrlData(robotsUrl)}});var web={hostname:null,protocol:"http://",invalidurl:!0,robotsurl:null,robotstxt:null}}();