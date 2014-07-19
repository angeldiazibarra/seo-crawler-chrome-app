(function(){ 
  "use strict";
    
  var app = angular.module('myCrawler', [ ]);
  // console.log('app.js load');
  
  app.factory('getRobots', function($http,getSitemap) {
    return {
      getRobotsData: function(url) {       
        $http.get(url)
        .success(function(data, status, headers, config) {
          var robotsArray = data.match(/[^\r\n]+/g);
          web.robotsurl = url;
          web.robotstxt = robotsArray;
          for (var i in robotsArray){
              if(robotsArray[i].match(/sitemap:/i)){
                  var sitemap = robotsArray[i].replace(/sitemap\:/i,'').trim();
                  web.sitemaps.push(sitemap);
                  getSitemap.getSitemapData(sitemap);
              };
          }
        })
        .error(function(data, status, headers, config) {
          web.robotsurl = null;
          web.robotstxt = null;
        });
      }
    };
  });
  
  app.factory('getSitemap', function($http) {
    return {
      getSitemapData: function(url) { 
        $http.get(url)
        .success(function(data, status, headers, config) {
          var urlsArray = data.match(/[^\r\n]+/g);
          web.urls = urlsArray;
          for (var i in urlsArray){
            var item = urlsArray[i].trim();
            if(item.match(/(\<loc\>)(.*)(\<\/loc\>)/i)){
              var unit = item.replace(/\<\/?loc\>/gi,'').trim();
              console.log(unit);
              web.urls.push(unit);                
            }
            if(item.match(/(\<link\>)(.*)(\<\/link\>)/i)){
              var unit = item.replace(/\<\/?link\>/gi,'').trim();
              console.log(unit);
              web.urls.push(unit);                
            }
          }
        });
      }
    };
  });

  app.controller('CrawlerController', function($scope,getRobots,getSitemap){
    // console.log('CrawlerController load');
    
    this.website = web;
    
    $scope.CheckUrl = function(){
      var checkUrl = web.hostname;
      // console.log(checkUrl);
      
      if(checkUrl.match(/^(http:\/\/)/i)){
          web.protocol = 'http://';
          checkUrl = checkUrl.replace(/^(http:\/\/)/i,'');
      }
      if(checkUrl.match(/^(https:\/\/)/i)){
          web.protocol = 'https://';
          checkUrl = checkUrl.replace(/^(https:\/\/)/i,'');
      }
      
      web.hostname = checkUrl;
      
      if(checkUrl.match(/^(https?:\/\/)?([a-z0-9]+\.*-*)+(\.[a-z]{2,6})$/i)){
        // console.log('valid');
        web.invalidurl = false;
      }else{
        // console.log('invalid');
        web.invalidurl = true;
      }
    };
    
    $scope.SelectProtocol = function(protocol){
      // console.log(protocol);
      web.protocol = protocol;
    };
    
    $scope.ShowRobots = function(){
      if(web.robotsurl === null){
        return('false');
      }else{
        return('true');
      }
    };
    
    $scope.ShowSitemaps = function(){
      web.sitemaps = $scope.ArrayUnique(web.sitemaps);
      if(web.sitemaps.length === 0){
        return('false');
      }else{
        return('true');
      }
    };
    
    $scope.ArrayUnique = function(a) {
      return a.reduce(function(p, c) {
        if (p.indexOf(c) < 0) p.push(c);
        return p;
      }, []);
    };
    
    $scope.CodeComment = function(line){
      if (line.indexOf("#") > -1) {
        return('codecomment');
      }
    };
    
    $scope.DoCrawl = function(){
      // console.log(web);
      web.sitemaps = [];
      var url = web.protocol + web.hostname;
      var robotsUrl = web.protocol + web.hostname + '/robots.txt';
      var sitemapUrl = web.protocol + web.hostname + '/sitemap.xml';
      getRobots.getRobotsData(robotsUrl);
      web.sitemaps.push(sitemapUrl);
    };
    
  });
  
  var web = {
      hostname: null,
      protocol: 'http://',
      invalidurl: true,
      robotsurl: null,
      robotstxt: null,
      sitemaps: [],
      urls: []
  };
  
})();