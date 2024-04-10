//'use strict';

/**
 * @ngdoc function
 * @name billinguiApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the billinguiApp
 */
angular.module('billinguiApp')
  .controller('MappingController', ['$scope', 'api','$location', '$stateParams', '$uibModal', function ($scope, api, $location, $stateParams, $uibModal) {
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
                     $("#trlist").css('active');
          
                }
          api.getProfile()
    .then(function (prof) {
        $scope.profile = prof;
    });
    $scope.updateMapView = function () {
        $scope.changePage($scope.page);
    }
    api.getMappings(1)
        .then(function (c) {
                     $scope.count = c.count;
                    $scope.data = c.docs;
                    $scope.pages = c.pages;
                    $scope.page = c.page;
                    $scope.limit = c.limit;
                    $scope.load();
        })
         .catch(function (err) {
                    console.log(err);
                })
        $scope.changePage = function (pg) {
            $scope.page = pg;
             api.getMappings($scope.page)
        .then(function (c) {
                    $scope.count = c.count;
                    $scope.data = c.docs;
                    $scope.pages = c.pages;
                    $scope.page = c.page;
                    $scope.limit = c.limit;
        })
         .catch(function (err) {
                    console.log(err);
                })
        }
                $scope.newMap = function () {
            $scope.rec = {};
                 $scope.modal = $uibModal.open({
      animation: true,
      ariaLabelledBy: 'modal-title',
      ariaDescribedBy: 'modal-body',
      templateUrl: 'views/partials/modal-new-mapping.html',
      controller : 'MappingModalController',
      scope : $scope
    });
    $scope.modal.result.then(function (selectedItem) {
     $scope.updateMapView();
    }, function (err) {
     
    });
        
        }
        $scope.editMap = function (id) {
            $scope.recid = id;
            $scope.rec = {};
        $scope.availcur = [];
        api.getMapping(id)
            .then(function (ra) {
              $scope.rec = ra;
                 $scope.modal = $uibModal.open({
      animation: true,
      ariaLabelledBy: 'modal-title',
      ariaDescribedBy: 'modal-body',
      templateUrl: 'views/partials/modal-edit-mapping.html',
      controller : 'MappingModalController',
      scope : $scope
    });
    $scope.modal.result.then(function (selectedItem) {
     $scope.updateMapView();
    }, function (err) {
     
    });
            })
        }
        $scope.deleteMap = function (id) {
            api.deleteMapping(id)
                .then(function (za) {
                    $scope.updateMapView()
                })
        }
      } else {
          $location.path('/login');
      }
    
  }]);

   angular.module('billinguiApp')
    .controller('MappingModalController', ['$uibModalInstance', '$scope', 'api', '$stateParams', 'Upload', function($uibModalInstance, $scope, api, $stateParams, Upload) {
         api.getProfile()
    .then(function (prof) {
        $scope.profile = prof;
        if (prof.account_type == 'wholesaler') {
            $scope.distr = true;
        } else {
            $scope.distr = false;
        }
    });
        $scope.newMappingOK = function () {
            api.newMapping($scope.rec)
                .then(function (p) {
                    $uibModalInstance.close();
                })
        }
        $scope.editMappingOK = function () {
            api.editMapping($scope.recid, $scope.rec)
                .then(function (ma) {
                    $uibModalInstance.close();
                })
        }
       $scope.newUserCancel = function () {
        console.log('Cancel Was clicked');
        $uibModalInstance.dismiss();
    }
        $scope.newCCOK = function () {
            console.log($scope.account.permitted_apis, $scope.baa.apid)
            $scope.account.permitted_apis.push($scope.baa.apid);
            $uibModalInstance.close();
        }
    }]);