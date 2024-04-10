//'use strict';

/**
 * @ngdoc function
 * @name billinguiApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the billinguiApp
 */
angular.module('billinguiApp')
  .controller('RateListController', ['$scope', 'api','$location', '$stateParams', '$uibModal', '$timeout', function ($scope, api, $location, $stateParams, $uibModal, $timeout) {
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
                $scope.newRate = function () {
                    $scope.modal = $uibModal.open({
            animation: true,
            ariaLabelledBy: 'modal-title',
            ariaDescribedBy: 'modal-body',
            templateUrl: 'views/partials/modal-new-rate.html',
            controller : 'RateListModalController',
            scope : $scope
            });
            $scope.modal.result.then(function (selectedItem) {
            $timeout(function () {
               api.getRates()
        .then(function (r){
            $scope.myrates = r.rates;
            $scope.load();
        })
     .catch(function (err) {
            throw err;
        })
            });
            }, function () {
            console.log('but i waz dizmizeddd')
            });
        }
    $scope.editRate = function (id) {
        $scope.rateid = id;
        api.getRate(id)
            .then(function (f) {
                    $scope.rate = f;
                
                $scope.modal = $uibModal.open({
      animation: true,
      ariaLabelledBy: 'modal-title',
      ariaDescribedBy: 'modal-body',
      templateUrl: 'views/partials/modal-edit-rate.html',
      controller : 'RateListModalController',
     scope : $scope
    });
    $scope.modal.result.then(function (selectedItem) {
       $timeout(function () {
           api.getRates()
            .then(function (r) {
                $scope.myrates = r.rates;
            })
            .catch(function (err) {
            throw err;
        })
       });
    }, function () {
      console.log('but i waz dizmizeddd')
    });
            })

    }
    $scope.deleteRate = function (id) {
        $scope.rateid = id;
        api.getRate(id)
            .then(function (f) {
                    $scope.rate = f;
                
                $scope.modal = $uibModal.open({
      animation: true,
      ariaLabelledBy: 'modal-title',
      ariaDescribedBy: 'modal-body',
      templateUrl: 'views/partials/modal-delete-rate.html',
      controller : 'RateListModalController',
     scope : $scope
    });
    $scope.modal.result.then(function (selectedItem) {
       $timeout(function () {
           api.getRates()
            .then(function (r) {
                $scope.myrates = r.rates;
            })
            .catch(function (err) {
            throw err;
        })
       });
    }, function () {
      console.log('but i waz dizmizeddd')
    });
            })
    }
            $scope.load = function () {
                  var link = $("#pinHead");
        var upSpeed     = 250;
        var downSpeed   = 250;
                    link.addClass('open').next().slideDown(downSpeed);
                    // Resize #page-content to fill empty space if exists
                    setTimeout(resizePageContent, ((upSpeed > downSpeed) ? upSpeed : downSpeed));

          
                }
          api.getProfile()
    .then(function (prof) {
        $scope.profile = prof;
        $scope.load();
        return api.getRates();
    })
    .then(function (ee) {
        $scope.myrates = ee.rates;
    })
 
      } else {
          $location.path('/login');
      }
    
  }]);

  angular.module('billinguiApp')
    .controller('RateListModalController', ['$uibModalInstance', '$scope', 'api', '$stateParams', 'Upload', function($uibModalInstance, $scope, api, $stateParams, Upload) {
        $scope.createRateOK = function () {
            api.createRate($scope.rate)
                .then(function (re) {
                    $uibModalInstance.close();
                })
                .catch(function (err) {
                    $uibModalInstance.dismiss();
                })
        }
           $scope.editRateOK = function () {
               var nrate = {};
               nrate.rate = $scope.rate.rate;
            api.editRate($scope.rateid, nrate)
                .then(function (re) {
                    $uibModalInstance.close();
                })
                .catch(function (err) {
                    $uibModalInstance.dismiss();
                })
        }
        $scope.deleteRateOK = function () {
            api.deleteRate($scope.rateid)
                .then(function (f) {
                    $uibModalInstance.close();
                })
                .catch(function (err) {
                    $uibModalInstance.dismiss();
                })
        }

        $scope.invalidatePinOK = function () {

            api.invalidatePin($scope.batchid, $scope.pinid)
                .then(function (z) {
                    $uibModalInstance.close();
                })
                 .catch(function (err) {
                    $uibModalInstance.dismiss();
                })
        }
            $scope.invalidateBatchOK = function () {
            api.invalidateBatch($scope.batchid)
                .then(function (z) {
                    $uibModalInstance.close();
                })
                 .catch(function (err) {
                    $uibModalInstance.dismiss();
                })
        }
        $scope.cancel = function () {
            $uibModalInstance.dismiss();
        }
           $scope.popup1 = {
            opened: false
        };
        $scope.popup2 = {
            opened: false
        }
         $scope.open1 = function() {
            $scope.popup1.opened = true;
        };
        $scope.open2 = function () {
            $scope.popup2.opened = true;
        }
          }]);