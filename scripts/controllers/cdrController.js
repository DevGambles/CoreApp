//'use strict';

/**
 * @ngdoc function
 * @name billinguiApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the billinguiApp
 */
angular.module('billinguiApp')
  .controller('CdrController', ['$scope', 'api','$location', '$uibModal', '$timeout', '$stateParams', function ($scope, api, $location, $uibModal, $timeout, $stateParams) {
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

          
                }
          api.updateProfile()
            .then(function (prof) {
                $scope.profile = prof;
                if (($scope.profile.account_type =='reseller') || ($scope.profile.account_type == 'distributor')) {
                    $scope.res = true;
                } else {
                    $scope.res = false;
                }
                if ($scope.profile.account_type == 'distributor') {
                    $scope.dis = true;
                } else {
                    $scope.dis = false;
                }
            })
            .catch(function (err) {
                console.log(err);
            })
            api.getCallRecords($stateParams.account, 1)
                .then(function (c) {
                    $scope.total = c.total;
                    $scope.data = c.docs;
                    $scope.pages = c.pages;
                    $scope.page = c.page;
                    $scope.limit = c.limit;
                    console.log(c);
                })
                .catch(function (err) {
                    console.log(err);
                })
                $scope.changePage = function () {
                    api.getCallRecords($stateParams.account, $scope.page)
                        .then(function (c) {
                            $scope.total = c.total;
                    $scope.data = c.docs;
                    $scope.pages = c.pages;
                    $scope.page = c.page;
                    $scope.limit = c.limit;
                        })
                        .catch(function (err) {
                            console.log(err);
                        })
                }
         var updateAccountsView = function () {
            api.getAccounts()
    .then(function (acc) {
        console.log(acc);
        $scope.accounts = [];
        acc.accounts.forEach(function (f) {
            if (f._id == $scope.profile.main_account) {

            } else {
                $scope.accounts.push(f);
            }
        })
        $scope.accountcount = acc.count;
    });
        }
    
        $scope.deleteAccount = function (id) {
        $scope.recid = id;
        $scope.modal = $uibModal.open({
                    animation: true,
                    ariaLabelledBy: 'modal-title',
                    ariaDescribedBy: 'modal-body',
                    templateUrl: 'views/partials/modal-delete-account.html',
                    controller : 'AccountsModalController',
                    scope : $scope
                    });
                    $scope.modal.result.then(function (selectedItem) {
                    $timeout(function () {
                        updateAccountsView();
                    });
                    }, function () {
                    console.log('but i waz dizmizeddd')
                    });
    }
    //updateAccountsView();
    $scope.load();
      } else {
          $location.path('/login');
      }
    
  }]);

angular.module('billinguiApp')
    .controller('CdrModalController', ['$uibModalInstance', '$scope', 'api', '$stateParams', function($uibModalInstance, $scope, api, $stateParams) {

         $scope.accountsCancel = function () {
        console.log('Cancel Was clicked');
        $uibModalInstance.dismiss();
    }
    $scope.deleteOK = function () {
        api.deleteAccount($scope.recid)
            .then(function (d) {
                $uibModalInstance.close();
            })
            .catch(function (err) {
            $uibModalInstance.dismiss(err);
            })
    }

    }]);