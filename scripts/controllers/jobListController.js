//'use strict';

/**
 * @ngdoc function
 * @name billinguiApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the billinguiApp
 */
angular.module('billinguiApp')
  .controller('JobListController', ['$scope', 'api','$location', '$stateParams', '$interval', function ($scope, api, $location, $stateParams, $interval) {
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
                  var link = $("#home");
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
        return api.getAccount(prof.main_account);
    })
    .then(function (acc) {
        $scope.account = acc;
        return api.getAccountUsers(acc._id);
    })
    .then(function (u) {
        $scope.user_name = [];
        $scope.user_username = [];
        u.users.forEach(function (x) {
            if ('undefined' == typeof x.first_name) {
                x.first_name = ''
            }
            if ('undefined' == typeof x.last_name) {
                x.last_name = ''
            }
            $scope.user_name[x._id] = x.first_name  + " " + x.last_name;
            $scope.user_username[x._id] = x.username
        })
    })
    api.getJobs()
        .then(function (c) {
                     $scope.data = c.jobs;
                     $scope.getMyStuff();
                     $scope.startInt();
        })
         .catch(function (err) {
                    console.log(err);
                })
    $scope.getMyStuff = function () {
 api.getJobs()
        .then(function (c) {
                     $scope.data = c.jobs;
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
            var torun = 0;
            $scope.data.forEach(function (f) {
                if (f.state !== 'fin') {
                    torun++
                }
            })
            if (torun > 0) {
                $scope.getMyStuff();
            } else {
                $scope.stopInt();
            }

}, 5000);
    }

 
   
      } else {
          $location.path('/login');
      }
    
  }]);

  