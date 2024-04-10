//'use strict';

/**
 * @ngdoc function
 * @name billinguiApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the billinguiApp
 */
angular.module('billinguiApp')
  .controller('wListController', ['$scope', 'api','$location', '$stateParams', '$uibModal', '$timeout', function ($scope, api, $location, $stateParams, $uibModal, $timeout) {
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
                     $("#wlist").css('active');
          
                }
                $scope.page = 1;
          api.getProfile()
    .then(function (prof) {
        $scope.profile = prof;
    });
    api.getWithdrawals($scope.page)
        .then(function (c) {
                     $scope.total = c.total;
                    $scope.data = c.docs;
                    $scope.pages = c.pages;
                    $scope.page = c.page;
                    $scope.limit = c.limit;
            return api.getAccounts();
        })
        .then(function (acc) {
            var oo = [];
            acc.accounts.forEach(function (f) {
                oo[f._id] = f.account_name;
            });
            $scope.account_names = oo;
            $scope.load();
        })
         .catch(function (err) {
                    console.log(err);
                })
        $scope.changePage = function (pg) {
            $scope.page = pg;
             api.getWithdrawals($scope.page)
        .then(function (c) {
                     $scope.total = c.total;
                    $scope.data = c.docs;
                    $scope.pages = c.pages;
                    $scope.page = c.page;
                    $scope.limit = c.limit;
            return api.getAccounts();
        })
        .then(function (acc) {
            var oo = [];
            acc.accounts.forEach(function (f) {
                oo[f._id] = f.account_name;
            });
            $scope.account_names = oo;
            $scope.load();
        })
         .catch(function (err) {
                    console.log(err);
                })
        }
                $scope.review = function (id) {
            $scope.recid = id;
                api.getWithdrawals($scope.recid)
                    .then(function (w) {
                        $scope.rec = w;
                        $scope.modal = $uibModal.open({
            animation: true,
            ariaLabelledBy: 'modal-title',
            ariaDescribedBy: 'modal-body',
            templateUrl: 'views/partials/modal-edit-withdrawal.html',
            controller : 'WithdrawalModalController',
            scope : $scope
            });
            $scope.modal.result.then(function (selectedItem) {
            $timeout(function () {

 api.getWithdrawals($scope.page)
        .then(function (c) {
                     $scope.total = c.total;
                    $scope.data = c.docs;
                    $scope.pages = c.pages;
                    $scope.page = c.page;
                    $scope.limit = c.limit;
            return api.getAccounts();
        })
        .then(function (acc) {
            var oo = [];
            acc.accounts.forEach(function (f) {
                oo[f._id] = f.account_name;
            });
            $scope.account_names = oo;
            $scope.load();
        })
         .catch(function (err) {
                    console.log(err);
                })

            });
            }, function () {
            console.log('but i waz dizmizeddd')
            });
                    })
                    .catch(function (err) {
                    console.log(err);
                })
                    
        }
      } else {
          $location.path('/login');
      }
    
  }]);

   angular.module('billinguiApp')
    .controller('WithdrawalModalController', ['$uibModalInstance', '$scope', 'api', '$stateParams', 'Upload', function($uibModalInstance, $scope, api, $stateParams, Upload) {
        $scope.cancel = function () {
            $uibModalInstance.dismiss();
        }
        
        $scope.weditOK = function () {
            api.updateWithdrawal($scope.recid, $scope.rec)
                .then(function (f) {
                    $uibModalInstance.close();
                })
                .catch(function (err) {
                    console.log(err);
                    $uibModalInstance.dismiss();
                })
        }
    }]);