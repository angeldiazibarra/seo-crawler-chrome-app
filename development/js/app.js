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
      var checkUrl = web.hostname.replace(/\/$/, "");
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
    
    $scope.FormatCount = function(num) {
        if(num > 999999){
            num = num/1000000;
            num = Math.floor(num);
            num = '+'+num+'m';
        }else if(num > 999){
            num = num/1000;
            num = Math.floor(num);
            num = '+'+num+'k';
        }
        return num;
    };
    
    $scope.Unformat = function(num) {
        if(num.indexOf("m") > -1){
            num = num.replace('m', '');
            num = parseInt(num);
            num = num*1000000;
            return num;
        }
        if(num.indexOf("k") > -1){
            num = num.replace('k', '');
            num = parseInt(num);
            num = num*1000;
        }
        return num;
    };

    $scope.GplusFormat = function(num) {
        if(num.indexOf("m") > -1){
            num = num.replace('m', '');
            num = parseInt(num);
            num = num*1000000;
            return num;
        }
        if(num.indexOf("k") > -1){
            num = num.replace('k', '');
            num = parseInt(num);
            num = num*1000;
            return num;
        }
        if(num.indexOf(".") > -1){
            num = num.replace('.', '');
            num = parseInt(num);
        }
        return num;
    };
    
    $scope.DoCrawl = function(){

      web.urls = [];
      web.sitemaps = [];
      web.processed = [];
      web.pages = [];
      web.robotstxt = null;   
      web.mapurls = [];
      web.external = [];
      web.internal = [];
      web.images = [];
      
      var url = web.protocol + web.hostname;    
      var statusurl = 'http://www.metricspot.com/api/status?url='+url;

      urlData.getData(statusurl).then(function(data){
          
          // console.log(data);
          
          url = data.target.replace(/\/$/, "");
          var robotsUrl = url + '/robots.txt';
          var sitemapUrl = url + '/sitemap.xml';

          web.robotsurl = robotsUrl;
          web.sitemaps.push(sitemapUrl);
          web.urls.push(data.target); 
          $scope.crawlSitemaps();
          
          if(data.code === 200){
              
            urlData.getData(robotsUrl).then(function(data){
              $scope.parseRobots(data);
              $scope.crawlSitemaps();
            }).then(function(){
              // console.log(web);
            });
            
          }else if(data.code === 301 || data.code === 302){
            if(data.target.match(/^(http:\/\/)/i)){
                web.protocol = 'http://';
            }
            if(data.target.match(/^(https:\/\/)/i)){
                web.protocol = 'https://';
            }
            web.hostname = url.replace(web.protocol,'');
          }
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
      web.processed = $scope.ArrayUnique(web.processed);
      if(web.urls.length !== 0 && web.processed.length <= 10){    
        // console.log(web.urls.length + ' ' + web.processed.length);
        var mainurl = web.protocol + web.hostname;
        
        web.urls.forEach(function(url){
          if(!$scope.IsInArray(url,web.processed)){
            web.processed.push(url); 
            var crawlurl = 'http://www.metricspot.com/api/crawlurl?url='+url;
            urlData.getData(crawlurl).then(function(data){
                web.processed.push(data.url); 

                data.social = [];
                data.social.fb = 0;
                data.social.tw = 0;
                data.social.gp = 0;
                data.social.ln = 0;
                
                var fbapiurl = 'https://graph.facebook.com/fql?q=SELECT%20total_count%20FROM%20link_stat%20WHERE%20url=%27' +encodeURIComponent(data.url)+ '%27';
                var twapiurl = 'http://cdn.api.twitter.com/1/urls/count.json?url='+data.url;
                var gplusurl = 'https://plusone.google.com/_/+1/fastbutton?url=' + encodeURIComponent(data.url); 
                var linkdurl = 'http://www.linkedin.com/countserv/count/share?url=' + data.url + '&format=json';
                                
                urlData.getData(fbapiurl).then(function(json){
                    data.social.fb = $scope.FormatCount(json.data[0].total_count);
                });

                urlData.getData(twapiurl).then(function(json){
                    data.social.tw = $scope.FormatCount(json.count);
                });
                
                urlData.getData(gplusurl).then(function(json){
                    var count = json.match(/<div id=\"aggregateCount\" class=\"Oy\">(.*?)<\/div>/);
                    count = $scope.GplusFormat(count[1]);
                    var formatted = $scope.FormatCount(count);
                    var unformatted = $scope.Unformat(formatted);
                    data.social.gp = formatted;
                });
                
                urlData.getData(linkdurl).then(function(json){
                    data.social.ln = $scope.FormatCount(json.count);
                });              
                
                data.displayurl = data.url.replace(/^http:\/\//i, "");
                
                data.displaytitle = $scope.TrimString(data.title,70);
                data.displaydescription = $scope.TrimString(data.metadescription,155);
                
                if(data.title.length === 0 || data.title === false){
                    data.title = false;
                    data.titlemessage = 'ERROR - Not set';
                    data.tscore = "error";
                }else if(data.title.length > 70){
                    data.titlemessage = 'ERROR - Title too long';
                    data.tscore = "error";
                }else{
                    data.titlemessage = false;
                    data.tscore = "pass";
                }
                
                if(data.descriptioncount > 1){
                    data.descriptionmessage = 'ERROR - Multiple META DESCRIPTIONS';
                    data.dscore = "error";
                }else if(data.metadescription.length === 0 || data.metadescription === false){
                    data.metadescription = false;
                    data.descriptionmessage = 'ERROR - Not set';
                    data.dscore = "error";
                }else if(data.metadescription.length > 155){
                    data.descriptionmessage = 'ERROR - Description too long';
                    data.dscore = "error";
                }else if(data.metadescription.length < 70){
                    data.descriptionmessage = 'ERROR - Description too short';
                    data.dscore = "error";
                }else if(data.metadescription.length > 145 && data.metadescription.length < 156){
                    data.descriptionmessage = 'WARNING - Description possibly cut';
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
                                
                if(data.robots !== false){
                    data.robotsmessage = false;
                    data.rscore = "pass";
                }else{
                    data.robotsmessage = 'WARNING - Meta Robots not set';
                    data.rscore = "warning";
                }
                                
                if(data.publisher !== false){
                    data.publishermessage = false;
                    data.pscore = "pass";
                }else{
                    data.publishermessage = 'WARNING - Google+ publisher not set';
                    data.pscore = "warning";
                }
                
                if(data.encoding !== false){                    
                    data.escore = "pass";
                    data.encodingmessage = false;
                }else{
                    data.escore = "error";                    
                    data.encodingmessage = 'ERROR - encoding not set';
                }
                
                if(data.language !== false){                    
                    data.lscore = "pass";
                    data.languagemessage = false;
                }else{
                    data.lscore = "error";                    
                    data.languagemessage = 'ERROR - language not set';
                }
                
                if(!data.headers.h1.length){                    
                    data.hscore = "error";
                    data.h1message = 'ERROR - H1 not set';
                }else{
                    data.hscore = "pass";                    
                    data.h1message = false;
                }
                
                data.links.internal.forEach(function(link){
                    link.url = data.url;
                    link.displayurl = '...' + data.url.replace(mainurl,'');
                    
                    if(link.title==="-"){
                        link.score = "warning";
                    }else{
                        link.score = "pass";
                    }
                    
                    web.internal.push(link); 
                    
                    if(!$scope.IsInArray(link.href,web.processed) && !$scope.IsInArray(link.href,web.urls)){
                        web.urls.push(link.href); 
                    }
                });
                
                data.links.external.forEach(function(link){
                    link.url = data.url;
                    link.displayurl = '...' + data.url.replace(mainurl,'');
                    
                    if(data.author === false && link.rel.match(/author/i)!== null){
                        data.author = link.href.replace(/(https?\:\/\/plus\.google\.com\/)/,'');
                    }
                    
                    if(link.title==="-"){
                        link.score = "warning";
                    }else{
                        link.score = "pass";
                    }
                    
                    web.external.push(link); 
                });

                var imgarray = $.map(data.images, function(value, index) {
                    return [value];
                });
                
                imgarray.forEach(function(img){
                    delete img['anchornum'];
                    img.url = data.url;
                    
                    img.displayurl = '...' + data.url.replace(mainurl,'');
                    
                    var filename = img.src.split('/');
                    img.filename = filename[filename.length-1];
                    
                    if(img.alt==="-"){
                        img.score = "error";
                    }else if(img.title==="-"){
                        img.score = "warning";
                    }else{
                        img.score = "pass";
                    }
                    web.images.push(img); 
                });
                                
                if(data.author !== false){
                    data.authormessage = false;
                    data.ascore = "pass";
                }else{
                    data.authormessage = 'WARNING - Google+ author not set';
                    data.ascore = "warning";
                }
                
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