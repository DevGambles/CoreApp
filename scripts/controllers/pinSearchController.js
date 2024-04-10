//'use strict';

/**
 * @ngdoc function
 * @name billinguiApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the billinguiApp
 */
angular.module('billinguiApp')
  .controller('PinSearchController', ['$scope', 'api','$location', function ($scope, api, $location) {
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
                  var link = $("#pinHead");
                  
        var upSpeed     = 250;
        var downSpeed   = 250;
                    link.addClass('open').next().slideDown(downSpeed);
                    // Resize #page-content to fill empty space if exists
                    setTimeout(resizePageContent, ((upSpeed > downSpeed) ? upSpeed : downSpeed));
                    $("#ps").css('active');
          
                }
                $scope.step = 1;
                $scope.obj = {};
                $scope.obj.pin = null;
                api.getAccounts()
                    .then(function (acc) {
                        $scope.account_names = [];
                        acc.accounts.forEach(function (f) {
                            $scope.account_names[f._id] = f.account_name;
                        })
                    })
                $scope.resetPin = function () {
                    $scope.obj = {};
                    $scope.step = 1;
                }
                $scope.getPin = function () {
                    api.pinSearch($scope.obj)
                        .then(function (pin) {
                            $scope.obj = pin;
                            $scope.step = 2;
                        })
                        .catch(function (err) {
                            $scope.err = true;
                            $scope.emsg = err.message;
                            $scope.step = 1;
                        })
                }
                $scope.getPinById = function (pin) {
                    api.getPin(pin)
                        .then(function(p) {
                            $scope.obj = p;
                            $scope.step = 3;
                        })
                }
                    $scope.getResCsv = function () {
        return $scope.obj.entries;
    }
                $scope.invalidatePin = function () {
                    api.invalidatePin($scope.obj.batch_id, $scope.obj._id)
                        .then(function (ok) {
                            var o = {
                                pin : $scope.obj.code
                            }
                           return api.pinSearch(o);
                        })
                        .then(function (pi) {
                            $scope.obj = pi;
                        })
                }

      } else {
        $location.path('/');
      }

  }]);
