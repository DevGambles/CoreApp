//'use strict';

/**
 * @ngdoc function
 * @name billinguiApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the billinguiApp
 */
angular.module('billinguiApp')
  .controller('ProviderController', ['$scope', 'api','$location', '$stateParams', '$uibModal', '$timeout', function ($scope, api, $location, $stateParams, $uibModal, $timeout) {
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
                    $("#prlist").css('active');
          
                }
                 api.updateProfile()
            .then(function (prof) {
                $scope.profile = prof;
                $scope.load();
            })
            .catch(function (err) {
                console.log(err);
            })
    $scope.deletePackage = function (id) {
        $scope.recid = id;
        $scope.modal = $uibModal.open({
      animation: true,
      ariaLabelledBy: 'modal-title',
      ariaDescribedBy: 'modal-body',
      templateUrl: 'views/partials/modal-delete-package.html',
      controller : 'PackagesModalController',
     scope : $scope
    });
    $scope.modal.result.then(function (selectedItem) {
       $timeout(function () {
           updatePackagesView();
       });
    }, function () {
      console.log('but i waz dizmizeddd')
    });
    }
           $scope.editPackage = function (id) {
        $scope.recid = id;
       api.getPackage($stateParams.account, id)
            .then(function (f) {
                $scope.rec = f;
                $scope.rec.package_price = parseInt($scope.rec.package_price);
                $scope.rec.package_callbalance = parseInt($scope.rec.package_callbalance);
            })
        $scope.modal = $uibModal.open({
      animation: true,
      ariaLabelledBy: 'modal-title',
      ariaDescribedBy: 'modal-body',
      templateUrl: 'views/partials/modal-edit-package.html',
      controller : 'PackagesModalController',
     scope : $scope
    });
    $scope.modal.result.then(function (selectedItem) {
       $timeout(function () {
           updatePackagesView();
       });
    }, function () {
      console.log('but i waz dizmizeddd')
    });
    }
    $scope.newPackage = function () {
        $scope.modal = $uibModal.open({
      animation: true,
      ariaLabelledBy: 'modal-title',
      ariaDescribedBy: 'modal-body',
      templateUrl: 'views/partials/modal-new-package.html',
      controller : 'PackagesModalController',
     scope : $scope
    });
    $scope.modal.result.then(function (selectedItem) {
       $timeout(function () {
           updatePackagesView();
       });
    }, function () {
      console.log('but i waz dizmizeddd')
    });
    }
   
    var updateProviderListView = function () {
        api.getProviders()
            .then(function (p) {
                $scope.providers = p.providers;
            })
    }
    
    var init = function () {
        updateProviderListView();
        $scope.load();
    }
    init();
      } else {
          $location.path('/login');
      }
    
  }]);


angular.module('billinguiApp')
    .controller('ProviderModalController', ['$uibModalInstance', '$scope', 'api', '$stateParams', function($uibModalInstance, $scope, api, $stateParams) {
    $scope.packageCancel = function () {
        $uibModalInstance.dismiss();
    }
    $scope.deleteOK = function () {
        api.deletePackage($stateParams.account, $scope.recid)
            .then(function (f) {
                $uibModalInstance.close();
            })
    }
    $scope.editPackageOK = function (){
         api.updatePackage($stateParams.account, $scope.recid, $scope.rec)
            .then(function (f) {
                $uibModalInstance.close();
            })
            .catch(function (err) {
                $uibModalInstance.dismiss(err);
           });
    }
    $scope.newPackageOK = function () {
        api.createPackage($stateParams.account, $scope.rec)
                    .then(function (f) {
                        $uibModalInstance.close();
                    })
                    .catch(function (err) {
                        $uibModalInstance.dismiss(err);
                    })
    }
    }]);