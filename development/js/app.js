(function(){ 
  "use strict";
    
  var app = angular.module('myCrawler', [ ]);
  // console.log('app.js load');
  
  app.factory('getUrl', function($http) {
    return {
      getUrlData: function(url) {       
        $http.get(url)
        .success(function(data, status, headers, config) {
          console.log(data);
          console.log(status);
          // console.log(headers);
          // console.log(config);
          web.robotstxt = data;
        })
        .error(function(data, status, headers, config) {
          console.log(data);
          console.log(status);
          // console.log(headers);
          // console.log(config);
          web.robotstxt = null;
        });
      }
    };
  });

  app.controller('CrawlerController', function($scope, getUrl){
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
    
    $scope.DoCrawl = function(){
      // console.log(web);
      var url = web.protocol + web.hostname;
      var robotsUrl = web.protocol + web.hostname + '/robots.txt';
      getUrl.getUrlData(robotsUrl);
    };
    
  });
  
  var web = {
      hostname: null,
      protocol: 'http://',
      invalidurl: true,
      robotstxt: null
  }
  
})();