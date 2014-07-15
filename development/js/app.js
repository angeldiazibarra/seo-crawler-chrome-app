(function(){ 
    
  var app = angular.module('myCrawler', [ ]);
  console.log('app.js load');

  app.controller('CrawlerController', function($scope){
    console.log('CrawlerController load');
    
    this.website = web;
    
    $scope.CheckUrl = function(){
      var checkUrl = web.hostname;
      console.log(checkUrl);
      if(checkUrl.match(/^(https?:\/\/)?([a-z0-9]+\.*-*)+(\.[a-z]{2,4})$/i)){
        console.log('valid');
        web.invalidurl = false;
      }else{
        console.log('invalid');
        web.invalidurl = true;
      }
    };
    
  });
  
  var web = {
      hostname: null,
      protocol: 'http://',
      invalidurl: true
  }
  
})();