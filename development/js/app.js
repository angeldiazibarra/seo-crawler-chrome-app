(function(){ 
    
  var app = angular.module('myCrawler', [ ]);
  console.log('app.js load');

  app.controller('CrawlerController', function($scope){
    console.log('CrawlerController load');
    
    this.website = web;
    
    $scope.CheckUrl = function(){
      console.log(web);
    };
    
  });
  
  var web = {
      hostname: null,
      protocol: 'http://',
      validurl: false
  }
  
})();