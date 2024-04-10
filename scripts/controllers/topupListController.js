//'use strict';

/**
 * @ngdoc function
 * @name billinguiApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the billinguiApp
 */
angular.module('billinguiApp')
  .controller('TopupListController', ['$scope', 'api','$location', '$stateParams', '$uibModal', function ($scope, api, $location, $stateParams, $uibModal) {
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
                     $("#tolist").css('active');
          
                }
          api.getProfile()
    .then(function (prof) {
        $scope.profile = prof;
           $scope.filtered = false;
        $scope.filterBase = '';
        $scope.summary = {};
         $scope.filter = {
                date_from : '',
                time_from : '',
                date_to : '',
                time_to : '',
                timezone : 'Europe/London',
                customer_reference : '',
                operator_reference : '',
                success : '',
                code : '',
                product_id : '',
                target : '',
                country : '',
                operator_name : '',
		channel : '',
		vnd_sim : ''
            }  
            
            return api.getAccounts()
        })
          .then(function (acc) {
            var oo = [];
            acc.accounts.forEach(function (f) {
                oo[f._id] = f.account_name;
            });
            $scope.account_names = oo;
            $scope.accounts = acc.accounts;
            return api.getCountries();
           
        })
        .then(function (bcc) {
            $scope.countries = bcc;
             $scope.load();
            $scope.changePage(1)
        })
         .catch(function (err) {
                    console.log(err);
                })

                                $scope.applyFilter = function () {
                    $scope.filtered = true;
                    $scope.filterBase = null;
                    api.getTopupsFilter($scope.filter, $scope.page)
                        .then(function (c) {
                            $scope.count = c.count;
                    $scope.data = c.docs;
                    $scope.limit = c.limit;
                    $scope.filterBase = c.filter;
                    $scope.summary = c.summary;
                     return api.getAccounts();
        })
        .then(function (acc) {
            var oo = [];
            acc.accounts.forEach(function (f) {
                oo[f._id] = f.account_name;
            });
            $scope.account_names = oo;
            
        })
         .catch(function (err) {
                    console.log(err);
                })
            }
                        $scope.clearFilter = function () {
                $scope.filtered = false;
        $scope.filterBase = '';
         $scope.filter = {
                date_from : '',
                time_from : '',
                date_to : '',
                time_to : '',
                timezone : 'Europe/London',
                customer_reference : '',
                operator_reference : '',
                success : '',
                code : '',
                product_id : '',
                target : '',
                country : '',
                operator_name : '',
		channel : '',
		vnd_sim : ''
            }
            $scope.changePage(1)
            }

        $scope.changePage = function (pg) {
            $scope.page = pg;
            if ($scope.filtered) {
                api.getTopupsFilter($scope.filter, $scope.page)
                        .then(function (c) {
                            $scope.count = c.count;
                    $scope.data = c.docs;
                    $scope.limit = c.limit;
                    $scope.filterBase = c.filter;
                    $scope.summary = c.summary;
                     return api.getAccounts();
        })
        .then(function (acc) {
            var oo = [];
            acc.accounts.forEach(function (f) {
                oo[f._id] = f.account_name;
            });
            $scope.account_names = oo;
            
        })
         .catch(function (err) {
                    console.log(err);
                })
            } else {
                api.getTopups($scope.page)
        .then(function (c) {
                     $scope.count = c.count;
                    $scope.data = c.docs;
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
        })
         .catch(function (err) {
                    console.log(err);
                })
            }
             

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
                 $scope.showLog = function (id) {
             $scope.recid = id;
             api.getTopup(id)
                .then(function (t) {
                    $scope.rec = t;
                      $scope.modal = $uibModal.open({
      animation: true,
      ariaLabelledBy: 'modal-title',
      ariaDescribedBy: 'modal-body',
      templateUrl: 'views/partials/modal-view-log.html',
      controller : 'AccountsModalController',
      scope : $scope
    });

    $scope.modal.result.then(function (selectedItem) {
       
    }, function () {
      console.log('but i waz dizmizeddd')
    });
                })
       
    }
      } else {
          $location.path('/login');
      }
    
  }]);

  
