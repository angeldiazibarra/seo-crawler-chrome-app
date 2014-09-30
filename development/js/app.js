(function(){ 
  "use strict";
  
  var maxpagelength = 20;
  var maxdatalength = 50;
  
  angular.module('underscore', []).factory('_', function() {
    return window._; // assumes underscore has already been loaded on the page
  });

  var app = angular.module('myCrawler', ['underscore']);
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
      },
      putData:function(apiurl,url){
        var deferred = $q.defer();
        $http({
          url: apiurl,
          method: "PUT",
          data: { 'url' : url }
        })
        .then(function(response) {
          deferred.resolve(response.data);
        },function(error) {
          deferred.reject(error.status);
        });
        return deferred.promise;
      }
    };
  });
  
  app.directive('showTab', function () {
    return {
      link: function (scope, element) {
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



  app.controller('CrawlerController', function($scope,urlData,_){
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
    
    $scope.ShowRandS = function(){
      web.sitemaps = $scope.ArrayUnique(web.sitemaps);
      if(web.robotsurl === null && web.sitemaps.length === 0){
        return('false');
      }else{
        return('true');
      }
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
      var sizeext = $scope.ObjectSize(web.external);
      var sizeint = $scope.ObjectSize(web.internal);
      if(sizeext === 0 && sizeint === 0){
        return('false');
      }else{
        return('true');
      }
    };
    
    $scope.ShowExternal = function(){
      var size = $scope.ObjectSize(web.external);
      if(size === 0){
        return('false');
      }else{
        return('true');
      }
    };
    
    $scope.ShowInternal = function(){
      var size = $scope.ObjectSize(web.internal);
      if(size === 0){
        return('false');
      }else{
        return('true');
      }
    };
    
    $scope.ObjectSize = function(obj) {
      var size = 0, key;
      for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
      }
      return size;
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
            if(web.urls.length <= maxpagelength){
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
        }
        for (var i in urlsArray2){
            if(web.urls.length <= maxpagelength){
                var item = urlsArray2[i].trim();
                var unit = item.replace(/\<\/?link\>/gi,'').trim();
                if(web.urls.indexOf(unit) === -1){
                  web.urls.push(unit);
                  web.mapurls.push(unit);
                }
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

    $scope.CodeScore = function(code) {
        if(code === 200){
            return("pass");
        }else{
            return("warning");
        }
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

      var statusurl = 'http://www.metricspot.com/api/status';

      urlData.putData(statusurl,url).then(function(data){
        url = data.target.replace(/\/$/, "");
        var robotsUrl = url + '/robots.txt';
        var sitemapUrl = url + '/sitemap.xml';

        web.robotsurl = robotsUrl;
        web.sitemaps.push(sitemapUrl);
        web.urls.push(data.target); 
        $scope.crawlSitemaps();
        
        console.log(data);

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
          url = web.protocol + web.hostname;  
          robotsUrl = url + '/robots.txt';
          sitemapUrl = url + '/sitemap.xml';
          web.robotsurl = robotsUrl;
          web.sitemaps.push(sitemapUrl);
          
          urlData.getData(robotsUrl).then(function(data){
            $scope.parseRobots(data);
            $scope.crawlSitemaps();
          }).then(function(){
            // console.log(web);
          });
        }else{
            // console.log(web);
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
      if(web.urls.length !== 0 && web.pages.length < maxpagelength){    
        // console.log(web.urls.length + ' ' + web.processed.length);
        var mainurl = web.protocol + web.hostname;
        
        web.urls.forEach(function(url){
            
          var matcharray = _.find(web.pages, function(item){
            return item.url === url;
          });
                    
          if(!matcharray && web.pages.length < maxpagelength){      
            var crawlurl = 'http://www.metricspot.com/api/crawlurl?url='+url;
            urlData.getData(crawlurl).then(function(data){

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
                
                
                /* TO DO: Refactor and resolve undefined conflict */
                
                if(data.code !== 'undefined' && data.code !== null){
                    // var statusid = data.code.substring(0,1);
                  
                    if(data.code === 301 || data.code === 302){
                        data.cscore = "warning";
                        data.cmessage = 'WARNING - Redirects from: ' + data.url;
                        data.url = data.target;
                    /*
                    }else if(statusid === 4){
                        data.cscore = "error";
                        data.cmessage = 'ERROR - Page not found: ' + data.url; 
                    }else if(statusid === 5){
                        data.cscore = "error";
                        data.cmessage = 'ERROR - Server error: ' + data.url; 
                    */
                    }else{
                        data.cscore = "pass";                    
                        data.cmessage = false; 
                    }
                }             
                
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
                                
                if(data.frames === false){
                    data.framesmessage = false;
                    data.fscore = "pass";
                }else{
                    data.framesmessage = 'WARNING - Frames/iFrames found';
                    data.fscore = "warning";
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

                var imgarray = $.map(data.images, function(value, index) {
                    return [value];
                });
                
                data.imgstats = [];
                data.imgstats.total = 0;
                data.imgstats.noalttit = 0;
                data.imgstats.noalt = 0;
                data.imgstats.notit = 0;
                data.imgstats.correct = 0;
                data.iscore = "pass";
                
                imgarray.forEach(function(img){                   
                    data.imgstats.total++;
                    if(img.alt==='-' && img.tit==='-'){
                        data.imgstats.noalttit++;
                    }else if(img.alt==='-'){
                        data.imgstats.noalt++;
                    }else if(img.title==='-'){
                        data.imgstats.notit++;
                    }else{
                        data.imgstats.correct++;
                    } 
                });
                
                if(data.imgstats.correct > 0){
                    data.imgstats.correctperc = (data.imgstats.correct/data.imgstats.total)*100;
                }
                
                if(data.imgstats.notit > 0){
                    data.iscore = "warning";
                    data.imgstats.notitperc = (data.imgstats.notit/data.imgstats.total)*100;
                };
                
                if(data.imgstats.noalt > 0){
                    data.iscore = "error";
                    data.imgstats.noaltperc = (data.imgstats.noalt/data.imgstats.total)*100;
                };
                
                if(data.imgstats.noalttit > 0){
                    data.iscore = "error";
                    data.imgstats.noalttitperc = (data.imgstats.noalttit/data.imgstats.total)*100;
                };
                
                if(web.images.length < maxdatalength){
                
                  imgarray.forEach(function(img){
                    
                    img.data = [];
                    var imgdata = [];
                    
                    imgdata.url = data.url;
                    imgdata.displayurl = '...' + data.url.replace(mainurl,'');
                    
                    imgdata.title = img.title;
                    imgdata.alt = img.alt;
                    
                    var filename = img.src.split('/');
                    img.filename = filename[filename.length-1];
                    
                    if(img.alt==="-"){
                        imgdata.score = "error";
                    }else if(img.title==="-"){
                        imgdata.score = "warning";
                    }else{
                        imgdata.score = "pass";
                    }    

                    delete img['anchornum'];
                    delete img['title'];
                    delete img['alt'];           
                    
                    if(web.images.length < maxdatalength){
                        var matcharray = _.find(web.images, function(item){
                            return item.src === img.src;
                        });
                    
                        if(matcharray){
                            matcharray.data.push(imgdata);
                        }else{
                            img.code = 0;
                            img.type = '-';
                            img.score = 'pass';

                            if(web.images.length < maxdatalength){
                                web.images.push(img); 
                            }

                            var statusurl = 'http://www.metricspot.com/api/status';

                            urlData.putData(statusurl,img.src).then(function(statusdata){
                                img.code = statusdata.code;
                                img.type = statusdata.type;
                                var score = $scope.CodeScore(img.code);
                                if(score !== 'pass'){
                                    img.score = score;
                                }

                                var match = _.find(web.images, function(item){
                                    return item.src === img.src;
                                });
                                if(match){
                                    match.data.push(imgdata);
                                }
                            });
                        }  
                    }
                  });
                }
                
                data.linkstats = [];
                data.linkstats.total = 0;
                data.linkstats.external = 0;
                data.linkstats.internal = 0;
                data.linkstats.intnofollow = 0;
                data.linkstats.extnofollow = 0;
                
                data.links.external.forEach(function(link){
                    data.linkstats.total++;
                    data.linkstats.external++;
                    if(link.rel.indexOf("nofollow") > -1){
                        data.linkstats.extnofollow++;
                    };
                });
                
                data.links.internal.forEach(function(link){
                    data.linkstats.total++;
                    data.linkstats.internal++;
                    if(link.rel.indexOf("nofollow") > -1){
                        data.linkstats.intnofollow++;
                    };
                });
                
                data.linkstats.intdofollow = data.linkstats.internal - data.linkstats.intnofollow;
                data.linkstats.extdofollow = data.linkstats.external - data.linkstats.extnofollow;
                
                if(data.linkstats.total === 0){
                    data.linkstats.nofollowbar = 0;
                    data.linkstats.dofollowbar = 0;
                    data.linkstats.intlinksbar = 100;
                }else{
                    data.linkstats.nofollowbar = (data.linkstats.extnofollow/data.linkstats.total)*100;
                    data.linkstats.dofollowbar = (data.linkstats.extdofollow/data.linkstats.total)*100;
                    data.linkstats.intlinksbar = (data.linkstats.internal/data.linkstats.total)*100;
                }
                
                data.links.external.forEach(function(link){
                    
                    link.data = [];
                    var linkdata = [];
                    linkdata.anchor = link.anchor;
                    linkdata.title = link.title;
                    linkdata.url = data.url;
                    linkdata.displayurl = '...' + data.url.replace(mainurl,'');
                    linkdata.rel = link.rel;                   
                    
                    if(data.author === false && link.rel.match(/author/i)!== null){
                        data.author = link.href.replace(/(https?\:\/\/plus\.google\.com\/)/,'');
                    }
                    
                    if(link.title==="-"){
                        linkdata.score = "warning";
                    }else{
                        linkdata.score = "pass";
                    }
                    
                    delete link['anchor'];
                    delete link['title'];
                    delete link['url'];
                    delete link['displayurl'];
                    delete link['rel'];
                       
                    if(web.external.length < maxdatalength){

                        var matcharray = _.find(web.external, function(item){
                            return item.href === link.href;
                        });

                        if(matcharray){
                            matcharray.data.push(linkdata);
                        }else{
                            link.code = 0;
                            link.score = 'pass';
                            link.data.push(linkdata);
                            
                            if(web.external.length < maxdatalength){
                                web.external.push(link);
                            }

                            var statusurl = 'http://www.metricspot.com/api/status';

                            urlData.putData(statusurl,link.href).then(function(statusdata){
                                link.code = statusdata.code;
                                link.score = $scope.CodeScore(link.code);

                                var match = _.find(web.external, function(item){
                                    return item.href === link.href;
                                });
                                if(match){
                                    match.data.push(linkdata);
                                }                            
                            });
                        }
                    }
                });
                
                data.links.internal.forEach(function(link){
                    
                    link.data = [];
                    var linkdata = [];
                    linkdata.anchor = link.anchor;
                    linkdata.title = link.title;
                    linkdata.url = data.url;
                    linkdata.displayurl = '...' + data.url.replace(mainurl,'');
                    linkdata.rel = link.rel;
                    
                    if(link.title==="-"){
                        linkdata.score = "warning";
                    }else{
                        linkdata.score = "pass";
                    }

                    delete link['anchor'];
                    delete link['title'];
                    delete link['url'];
                    delete link['displayurl'];
                    delete link['rel'];
                    
                    if(web.internal.length < maxdatalength){

                        var matcharray = _.find(web.internal, function(item){
                            return item.href === link.href;
                        });

                        if(matcharray){
                            matcharray.data.push(linkdata);
                        }else{
                            link.code = 0;
                            link.score = 'pass';
                            link.data.push(linkdata);
                            
                            if(web.internal.length < maxdatalength){
                                web.internal.push(link);
                            }

                            var statusurl = 'http://www.metricspot.com/api/status';

                            urlData.putData(statusurl,link.href).then(function(statusdata){
                                link.code = statusdata.code;
                                link.score = $scope.CodeScore(link.code);

                                var match = _.find(web.internal, function(item){
                                    return item.href === link.href;
                                });
                                if(match){
                                    match.data.push(linkdata);
                                }                            
                            });
                        }

                        if(!$scope.IsInArray(link.href,web.processed) && !$scope.IsInArray(link.href,web.urls)){
                            web.urls.push(link.href); 
                        }
                    }
                });
                                
                if(data.author !== false){
                    data.authormessage = false;
                    data.ascore = "pass";
                }else{
                    data.authormessage = 'WARNING - Google+ author not set';
                    data.ascore = "warning";
                }
                
                if(web.pages.length < maxpagelength){
                    web.pages.push(data); 
                    console.log(data);
                }
            });
          }
        });
      }
    }, 2000);
      
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