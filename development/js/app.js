(function(){ 
    
  var app = angular.module('myCrawler', [ ]);
  console.log('app.js load');

  app.controller('CrawlerController', function(){
    console.log('CrawlerController load');
    
    this.website = web;
    
  });
  
  var web = {
      hostname: null,
      protocol: 'http://'
  }
  
})();