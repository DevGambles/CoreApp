//'use strict';

/**
 * @ngdoc function
 * @name billinguiApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the billinguiApp
 */
angular.module('billinguiApp')
  .controller('PriceTableController', ['$scope', 'api','$location', '$stateParams', '$uibModal', '$timeout', 'Upload', 'SweetAlert', function ($scope, api, $location, $stateParams, $uibModal, $timeout, Upload, SweetAlert) {
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
                  $("#ptables").addClass('active');
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


    $scope.trtoImport = function () {
        $scope.provid = 'TRTO';
         $scope.modal = $uibModal.open({
      animation: true,
      ariaLabelledBy: 'modal-title',
      ariaDescribedBy: 'modal-body',
      templateUrl: 'views/partials/modal-import-rate.html',
      controller : 'PriceModalController',
     scope : $scope
    });
    $scope.modal.result.then(function (selectedItem) {
       SweetAlert.swal({
                                        title : "Good Job!",
                                        text : "Rates Imported!",
                                        type : "success",
                                        closeOnConfirm : true
                                    }, function (ok) {
                                        if (ok) {
                                            
                                        }
                                        
                                    });
    }, function () {
      console.log('but i waz dizmizeddd')
    });
    }
        $scope.trloImport = function () {
            $scope.provid = 'TRLO';
         $scope.modal = $uibModal.open({
      animation: true,
      ariaLabelledBy: 'modal-title',
      ariaDescribedBy: 'modal-body',
      templateUrl: 'views/partials/modal-import-rate.html',
      controller : 'PriceModalController',
     scope : $scope
    });
    $scope.modal.result.then(function (selectedItem) {
       SweetAlert.swal({
                                        title : "Good Job!",
                                        text : "Rates Imported!",
                                        type : "success",
                                        closeOnConfirm : true
                                    }, function (ok) {
                                        if (ok) {
                                            
                                        }
                                        
                                    });
    }, function () {
      console.log('but i waz dizmizeddd')
    });
    }

  $scope.load();
      } else {
          $location.path('/login');
      }
    
  }]);


angular.module('billinguiApp')
    .controller('PriceModalController', ['$uibModalInstance', '$scope', 'api', '$stateParams', 'Upload', '$timeout', function($uibModalInstance, $scope, api, $stateParams, Upload, $timeout) {
    $scope.cancel = function () {
        $uibModalInstance.dismiss();
    }
    $scope.importOK = function() {
       var  file = $scope.filecsv;
        if (file) {
            file.upload = Upload.upload({
                url: '/api/pricetables/' + $scope.provid + '/import?token=' + $scope.profile.token,
                data: {rate: file}
            });
            $uibModalInstance.close();
            file.upload.then(function (response) {
                $timeout(function () {
                    file.result = response.data;
                    
                });
            }, function (response) {
                if (response.status > 0)
                    $scope.errorMsg = response.status + ': ' + response.data;
            }, function (evt) {
                file.progress = Math.min(100, parseInt(100.0 * 
                                         evt.loaded / evt.total));
            });
        }   
    }
    }]);