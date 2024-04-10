//'use strict';

/**
 * @ngdoc function
 * @name billinguiApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the billinguiApp
 */
angular.module('billinguiApp')
  .controller('newSmsController', ['$scope', 'api','$location', '$stateParams', 'ngProgressFactory', 'SweetAlert', function ($scope, api, $location, $stateParams, ngProgressFactory, SweetAlert) {
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
                  var link = $("#subAA");
        var upSpeed     = 250;
        var downSpeed   = 250;
                    link.addClass('open').next().slideDown(downSpeed);
                    // Resize #page-content to fill empty space if exists
                    setTimeout(resizePageContent, ((upSpeed > downSpeed) ? upSpeed : downSpeed));
                     $("#newsms").css('active');
          
                }
          api.getProfile()
    .then(function (prof) {
        $scope.profile = prof;
        $scope.obj = {};
        $scope.load();
    });
    $scope.init = function () {
        $scope.obj = {};
        $scope.obj.msisdn = '';
        $scope.obj.message = '';
    }
    $scope.sendSMS = function () {
        $scope.progressbar = ngProgressFactory.createInstance();
        $scope.progressbar.start();
        api.sendSms($scope.obj.msisdn, $scope.obj)
            .then(function (ti) {
                $scope.progressbar.complete();
                SweetAlert.swal({
                                        title : "Good Job!",
                                        text : "Your SMS with id #" + ti.message_id + " was sent!",
                                        type : "success",
                                        closeOnConfirm : true
                                    }, function (ok) {
                                        if (ok) {
                                             $scope.init();
                                        }
                                        
                                    });
            })
    }
        $scope.sendBulk = function () {
             $scope.obj.numbers = $scope.obj.msarr.split("\n");
        $scope.progressbar = ngProgressFactory.createInstance();
        $scope.progressbar.start();
        api.sendSmsBulk($scope.obj)
            .then(function (ti) {
                $scope.progressbar.complete();
                SweetAlert.swal({
                                        title : "Good Job!",
                                        text : "Your SMSes were sent!",
                                        type : "success",
                                        closeOnConfirm : true
                                    }, function (ok) {
                                        if (ok) {
                                             $scope.init();
                                        }
                                        
                                    });
            })
    }
      } else {
          $location.path('/login');
      }
    
  }]);

  