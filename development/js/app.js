(function(){ 
  "use strict";
    
  var app = angular.module('myCrawler', [ ]);
  // console.log('app.js load');
  
  app.factory('urlData', function($http,$q) {
    return{
      getData:function(url){
        var deferred = $q.defer();
        $http.get(url)
        .success(function(data, status, headers, config) {
          deferred.resolve(data);
        })
        .error(function(data, status, headers, config) {
          deferred.reject(status);
        });
        return deferred.promise;
      }
    };
  });
  
  app.directive('showTab', function () {
    return {
      link: function (scope, element, attrs) {
        element.click(function(e) {
          e.preventDefault();
          if(!element.parent().hasClass('disabled')){
            $(element).tab('show');
            tab = element.parent().attr('id');
            var tabid = '#'+tab+'tab';
            $('.navtabs').hide();
            $(tabid).show();
          }
        });
      }
    };
  });



  app.controller('CrawlerController', function($scope,urlData,showTab){
    // console.log('CrawlerController load');
    
    this.website = web;
    this.navtab = tab;
    
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
    
    $scope.ShowPages = function(){
      web.pages = $scope.ArrayUnique(web.pages);
      if(web.pages.length === 0){
        return('false');
      }else{
        return('true');
      }
    };
    
    $scope.ShowImages = function(){
      if(web.images.length === 0){
        return('false');
      }else{
        return('true');
      }
    };
    
    $scope.ShowLinks = function(){
      if(web.internal.length === 0 && web.external.length === 0){
        return('false');
      }else{
        return('true');
      }
    };
    
    $scope.ShowExternal = function(){
      if(web.external.length === 0){
        return('false');
      }else{
        return('true');
      }
    };
    
    $scope.ShowInternal = function(){
      if(web.internal.length === 0){
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
    
    $scope.parseRobots = function(data){
        var robotsArray = data.match(/[^\r\n]+/g);
        web.robotstxt = robotsArray;
        for (var i in robotsArray){
            if(robotsArray[i].match(/sitemap:/i)){
                var sitemap = robotsArray[i].replace(/sitemap\:/i,'').trim();
                if(web.sitemaps.indexOf(sitemap) === -1){
                    web.sitemaps.push(sitemap);
                }
            };
        }
    };
    
    $scope.crawlSitemaps = function(){
        for (var i in web.sitemaps){
          urlData.getData(web.sitemaps[i]).then(function(data){
            $scope.parseSitemap(data);
            for (var j in web.sitemaps){
                urlData.getData(web.sitemaps[j]).then(function(data){
                    $scope.parseSitemap(data);
                    // $scope.$digest();
                });
            }
          });
        }
    };
    
    $scope.parseSitemap = function(data){
        var urlsArray1 = data.match(/(\<loc\>)([a-z0-9:\/\-\.\?\=\#\_])*(\<\/loc\>)/gi);
        var urlsArray2 = data.match(/(\<link\>)([a-z0-9:\/\-\.\?\=\#\_])*(\<\/link\>)/gi);
        for (var i in urlsArray1){
            var item = urlsArray1[i].trim();
            var unit = item.replace(/\<\/?loc\>/gi,'').trim();
            if(unit.match(/(\.xml)$/i)){
              web.sitemaps.push(unit); 
              if(web.sitemaps.indexOf(unit) === -1){
                web.sitemaps.push(unit);
              }
            }else{
              if(web.urls.indexOf(unit) === -1){
                web.urls.push(unit);
                web.mapurls.push(unit);
              }
            }
        }
        for (var i in urlsArray2){
            var item = urlsArray2[i].trim();
            var unit = item.replace(/\<\/?link\>/gi,'').trim();
            if(web.urls.indexOf(unit) === -1){
              web.urls.push(unit);
              web.mapurls.push(unit);
            }
        }
    };
    
    $scope.TrimString = function(string,length){
        var trimmedString = string.length > length ? string.substring(0, length - 3) + "..." : string.substring(0, length);
        return trimmedString;
    };
    
    $scope.DoCrawl = function(){
      // console.log(web);
      web.urls = [];
      web.sitemaps = [];
      web.processed = [];
      web.pages = [];
      web.robotstxt = null;
      var url = web.protocol + web.hostname;
      var robotsUrl = web.protocol + web.hostname + '/robots.txt';
      var sitemapUrl = web.protocol + web.hostname + '/sitemap.xml';
      web.robotsurl = robotsUrl;
      web.sitemaps.push(sitemapUrl);
      web.urls.push(url); 
      $scope.crawlSitemaps();
      
      urlData.getData(robotsUrl).then(function(data){
        $scope.parseRobots(data);
        $scope.crawlSitemaps();
      }).then(function(){
        // console.log(web);
      });
    };
    
    $scope.IsInArray = function(value, array){
      return array.indexOf(value) > -1;
    };
    
    $scope.$watch("web",function(n,o) {
      // console.log(web.sitemaps);
    },true);
    
    setInterval(function(){
      web.urls = $scope.ArrayUnique(web.urls);
      if(web.urls.length !== 0 && web.processed.length <= 10){    
        // console.log(web.urls.length + ' ' + web.processed.length);           
        web.urls.forEach(function(url){
          if(!$scope.IsInArray(url,web.processed)){
            web.processed.push(url); 
            var crawlurl = 'http://www.metricspot.com/api/crawlurl?url='+url;
            urlData.getData(crawlurl).then(function(data){
                web.processed.push(data.url); 
                data.displayurl = data.url.replace(/^http:\/\//i, "");
                
                data.displaytitle = $scope.TrimString(data.title,70);
                data.displaydescription = $scope.TrimString(data.metadescription,155);
                
                if(data.title.length === 0 || data.title === false){
                    data.title = false;
                    data.titlemessage = 'ERROR - Not set';
                    data.tscore = "error";
                }else if(data.title.length > 70){
                    data.titlemessage = 'ERROR - Too long';
                    data.tscore = "error";
                }else{
                    data.titlemessage = false;
                    data.tscore = "pass";
                }
                
                if(data.metadescription.length === 0 || data.metadescription === false){
                    data.metadescription = false;
                    data.descriptionmessage = 'ERROR - Not set';
                    data.dscore = "error";
                }else if(data.metadescription.length > 155){
                    data.descriptionmessage = 'ERROR - Too long';
                    data.dscore = "error";
                }else if(data.metadescription.length < 70){
                    data.descriptionmessage = 'ERROR - Too short';
                    data.dscore = "error";
                }else if(data.metadescription.length > 145 && data.metadescription.length < 156){
                    data.descriptionmessage = 'WARNING - Possibly cut';
                    data.dscore = "warning";
                }else{
                    data.descriptionmessage = false;
                    data.dscore = "pass";
                }
                                
                if(data.url === data.canonical && data.canonical !== false){
                    data.canonicalmessage = false;
                    data.cscore = "pass";
                }else if(data.url !== data.canonical && data.canonical !== false){
                    data.canonicalmessage = 'ERROR - URL and canonical do not match';
                    data.cscore = "error";
                }else{
                    data.canonicalmessage = 'ERROR - Canonical not set';
                    data.cscore = "error";
                }
                                
                if(data.author !== false){
                    data.authormessage = false;
                    data.ascore = "pass";
                }else{
                    data.authormessage = 'WARNING - Google+ authorship not set';
                    data.ascore = "warning";
                }
                                
                if(data.publisher !== false){
                    data.publishermessage = false;
                    data.pscore = "pass";
                }else{
                    data.publishermessage = 'WARNING - Google+ publisher not set';
                    data.pscore = "warning";
                }
                
                if(data.descriptioncount === 1){                    
                    data.dcscore = "pass";
                }else{
                    data.dcscore = "error";                    
                }
                
                if(data.encoding === false){                    
                    data.escore = "error";
                }else{
                    data.escore = "pass";                    
                }
                
                if(data.language === false){                    
                    data.lscore = "error";
                }else{
                    data.lscore = "pass";                    
                }
                
                if(!data.headers.h1.length){                    
                    data.hscore = "error";
                }else{
                    data.hscore = "pass";                    
                }
                
                data.links.internal.forEach(function(link){
                    link.url = data.url;
                    web.internal.push(link); 
                    if(!$scope.IsInArray(link.url,web.processed) && !$scope.IsInArray(link.url,web.urls)){
                        web.urls.push(link.url); 
                    }
                });
                
                data.links.external.forEach(function(link){
                    link.url = data.url;
                    web.external.push(link); 
                });

                var imgarray = $.map(data.images, function(value, index) {
                    return [value];
                });
                
                imgarray.forEach(function(img){
                    delete img['anchornum'];
                    img.url = data.url;
                    web.images.push(img); 
                });
                
                web.pages.push(data); 
            });
          }
        });
      }
    }, 1000);
      
  });
  
  var tab = 'home';
  
  var web = {
      hostname: null,
      protocol: 'http://',
      invalidurl: true,
      robotsurl: null,
      robotstxt: null,
      sitemaps: [],
      urls: [],
      mapurls: [],
      processed: [],
      pages: [],
      external: [],
      internal: [],
      images: []
  };
    
})();