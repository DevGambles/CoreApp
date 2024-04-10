//'use strict';

/**
 * @ngdoc function
 * @name billinguiApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the billinguiApp
 */
angular.module('billinguiApp')
  .controller('ItemsController', ['$scope', 'api','$location', '$stateParams', '$uibModal', '$timeout', function ($scope, api, $location, $stateParams, $uibModal, $timeout) {
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
       $scope.newItem = function () {
        $scope.modal = $uibModal.open({
      animation: true,
      ariaLabelledBy: 'modal-title',
      ariaDescribedBy: 'modal-body',
      templateUrl: 'views/partials/modal-new-item.html',
      controller : 'ItemsModalController',
     scope : $scope
    });
    $scope.modal.result.then(function (selectedItem) {
       $timeout(function () {
           updateItemsView();
       });
    }, function () {
      console.log('but i waz dizmizeddd')
    });
    }

           $scope.editItem = function (id) {
        $scope.recid = id;
       api.getItem($stateParams.account, id)
            .then(function (f) {
                $scope.rec = f;
                $scope.rec.item_price = parseInt($scope.rec.item_price);
            })
            .catch(function (err) {
                console.error(err);
            })
        $scope.modal = $uibModal.open({
      animation: true,
      ariaLabelledBy: 'modal-title',
      ariaDescribedBy: 'modal-body',
      templateUrl: 'views/partials/modal-edit-item.html',
      controller : 'ItemsModalController',
     scope : $scope
    });
    $scope.modal.result.then(function (selectedItem) {
       $timeout(function () {
           updateItemsView();
       });
    }, function () {
      console.log('but i waz dizmizeddd')
    });
    }
        $scope.deleteItem = function (id) {
        $scope.recid = id;
        $scope.modal = $uibModal.open({
      animation: true,
      ariaLabelledBy: 'modal-title',
      ariaDescribedBy: 'modal-body',
      templateUrl: 'views/partials/modal-delete-item.html',
      controller : 'ItemsModalController',
     scope : $scope
    });
    $scope.modal.result.then(function (selectedItem) {
       $timeout(function () {
           updateItemsView();
       });
    }, function () {
      console.log('but i waz dizmizeddd')
    });
    }
 var updateItemsView = function () {
        api.getItems($stateParams.account)
            .then(function (ite) {
                $scope.items = ite.items;
            })
    }
    var initView = function () {
        updateItemsView();
    }
    initView();
      } else {
          $location.path('/login');
      }
    
  }]);

 angular.module('billinguiApp')
    .controller('ItemsModalController', ['$uibModalInstance', '$scope', 'api', '$stateParams', function($uibModalInstance, $scope, api, $stateParams) {
      $scope.cancel = function () {
          $uibModalInstance.dismiss();
      }
      $scope.newItemOK = function () {
          api.createItem($stateParams.account, $scope.rec)
            .then(function (f) {
                $uibModalInstance.close();
            })
            .catch(function (err) {
                $uibModalInstance.dismiss(err);
            })
      }
      $scope.editItemOK = function () {
          api.updateItem($stateParams.account, $scope.recid, $scope.rec)
            .then(function (f) {
                $uibModalInstance.close();
            })
            .catch(function (err) {
                $uibModalInstance.dismiss(err);
            })
      }
      $scope.deleteItemOK = function () {
          api.deleteItem($stateParams.account, $scope.recid, $scope.rec)
            .then(function (f) {
                $uibModalInstance.close();
            })
            .catch(function (err) {
                $uibModalInstance.dismiss(err);
            })
      }
  }]);