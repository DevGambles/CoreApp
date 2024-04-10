//'use strict';

/**
 * @ngdoc function
 * @name billinguiApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the billinguiApp
 */
angular.module('billinguiApp')
  .controller('RatecardsController', ['$scope', 'api','$location', '$stateParams', '$uibModal', '$timeout', function ($scope, api, $location, $stateParams, $uibModal, $timeout) {
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
                  var link = $("#callrates");
        var upSpeed     = 250;
        var downSpeed   = 250;
                    link.addClass('open').next().slideDown(downSpeed);
                    // Resize #page-content to fill empty space if exists
                   // setTimeout(resizePageContent, ((upSpeed > downSpeed) ? upSpeed : downSpeed));

          
                }
                 api.updateProfile()
            .then(function (prof) {
                $scope.profile = prof;
                $scope.load();
            })
            .catch(function (err) {
                console.log(err);
            })
    $scope.newRatecard = function () {
            $scope.modal = $uibModal.open({
                animation: true,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                templateUrl: 'views/partials/modal-new-ratecard.html',
                controller : 'RatecardsModalController',
                scope : $scope
                });
                $scope.modal.result.then(function (selectedItem) {
                $timeout(function () {
                    updateRateCardListView();
                });
                }, function () {
                console.log('but i waz dizmizeddd')
                });
    }
    $scope.editRoute = function (ratecard, id) {
        $scope.recid = id;
        $scope.rcid = ratecard
        $scope.masterroute = true;
        api.getAdminRoute(ratecard, id)
            .then(function (a) {
                $scope.route = a;
            })
        $scope.modal = $uibModal.open({
      animation: true,
      ariaLabelledBy: 'modal-title',
      ariaDescribedBy: 'modal-body',
      templateUrl: 'views/partials/modal-edit-route.html',
      controller : 'RatecardsModalController',
     scope : $scope
    });
    $scope.modal.result.then(function (selectedItem) {
       $timeout(function () {
           updateRateCardListView();
       });
    }, function () {
      console.log('but i waz dizmizeddd')
    });
    }
    $scope.newRoute = function () {
        $scope.masterroute = true;
        $scope.modal = $uibModal.open({
      animation: true,
      ariaLabelledBy: 'modal-title',
      ariaDescribedBy: 'modal-body',
      templateUrl: 'views/partials/modal-new-route.html',
      controller : 'RatecardsModalController',
     scope : $scope
    });
    $scope.modal.result.then(function (selectedItem) {
       $timeout(function () {
           updateRateCardListView();
       });
    }, function () {
      console.log('but i waz dizmizeddd')
    });
    }
    var updateRateCardListView = function () {

        api.getRatecards()
    .then(function (rc) {
        $scope.rcn = [];
        console.log(rc)
        $scope.ratecards = rc.ratecards;
        $scope.ratecards.forEach(function (f) {
            $scope.rcn[f._id] = f.ratecard_name;
        })
       return api.getRoutes($stateParams.account);
    })
    .then(function (ro) {
         $scope.routes = ro.routes;
    })
    }
    var init = function () {
        updateRateCardListView();
    }
    init();
      } else {
          $location.path('/login');
      }
    
  }]);


angular.module('billinguiApp')
    .controller('RatecardsModalController', ['$uibModalInstance', '$scope', 'api', '$stateParams', function($uibModalInstance, $scope, api, $stateParams) {
    $scope.newUserCancel = function () {
        $uibModalInstance.dismiss();
    }
    $scope.editRouteOK = function () {
        api.editAdminRoute($scope.rcid, $scope.recid, $scope.route)
            .then(function (f) {
                $uibModalInstance.close();
            })
    }
      $scope.createRouteOK = function () {
        api.createAdminRoute($scope.route.ratecard, $scope.route)
            .then(function (f) {
                $uibModalInstance.close();
            })
    }
    $scope.createRatecardOK = function () {
        api.createRatecard($scope.rec)
            .then(function (f) {
                $uibModalInstance.close();
            })
            .catch(function (err) {
                $uibModalInstance.dismiss(err);
            })
    }
    }]);