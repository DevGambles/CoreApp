//'use strict';

/**
 * @ngdoc function
 * @name billinguiApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the billinguiApp
 */
angular.module('billinguiApp')
  .controller('JobViewController', ['$scope', 'api','$location', '$stateParams', '$interval', function ($scope, api, $location, $stateParams, $interval) {
      if (api.isAuthed()) {
           var resizePageContent = function() {
                     page            = $('#page-container');
        pageContent     = $('#page-content');
        header          = $('header');
        footer          = $('#page-content + footer');
        sidebar         = $('#sidebar');
        sidebarAlt      = $('#sidebar-alt');
        sScroll         = $('.sidebar-scroll');

        var windowH         = $(window).height();
        var sidebarH        = sidebar.outerHeight();
        var sidebarAltH     = sidebarAlt.outerHeight();
        var headerH         = header.outerHeight();
        var footerH         = footer.outerHeight();

        // If we have a fixed sidebar/header layout or each sidebars’ height < window height
        if (header.hasClass('navbar-fixed-top') || header.hasClass('navbar-fixed-bottom') || ((sidebarH < windowH) && (sidebarAltH < windowH))) {
            if (page.hasClass('footer-fixed')) { // if footer is fixed don't remove its height
                pageContent.css('min-height', windowH - headerH + 'px');
            } else { // else if footer is static, remove its height
                pageContent.css('min-height', windowH - (headerH + footerH) + 'px');
            }
        }  else { // In any other case set #page-content height the same as biggest sidebar's height
            if (page.hasClass('footer-fixed')) { // if footer is fixed don't remove its height
                pageContent.css('min-height', ((sidebarH > sidebarAltH) ? sidebarH : sidebarAltH) - headerH + 'px');
            } else { // else if footer is static, remove its height
                pageContent.css('min-height', ((sidebarH > sidebarAltH) ? sidebarH : sidebarAltH) - (headerH + footerH) + 'px');
            }
        }
    };
            $scope.load = function () {
                  var link = $("#account");
        var upSpeed     = 250;
        var downSpeed   = 250;
                    link.addClass('open').next().slideDown(downSpeed);
                    // Resize #page-content to fill empty space if exists
                    setTimeout(resizePageContent, ((upSpeed > downSpeed) ? upSpeed : downSpeed));
                     $("#jlist").css('active');
          
                }
          api.getProfile()
    .then(function (prof) {
        $scope.profile = prof;
    });
    $scope.obj = {};
    $scope.obj.job = {};
    $scope.obj.job.state = 'pre';
    $scope.getMyStuff = function () {
 api.getJob($stateParams.id)
        .then(function (c) {
                     $scope.obj = c;
        })
         .catch(function (err) {
                    console.log(err);
                })
    }
    $scope.stopInt = function () {
        if (angular.isDefined(l)) {
            $interval.cancel(l);
            l = undefined;
        }
    }
    var l;
    $scope.startInt = function () {
        if (angular.isDefined(l)) {
            return;
        }
        l = $interval(function () {
    if ($scope.obj.state == 'fin') {
        $scope.stopInt();
    } else {    
        $scope.getMyStuff();
    }
}, 5000);
    }

 $scope.startInt();
   
      } else {
          $location.path('/login');
      }
    
  }]);

  