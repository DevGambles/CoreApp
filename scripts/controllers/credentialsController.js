//'use strict';

/**
 * @ngdoc function
 * @name billinguiApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the billinguiApp
 */
angular.module('billinguiApp')
  .controller('CredentialsController', ['$scope', 'api','$location', '$stateParams', '$uibModal', '$timeout', function ($scope, api, $location, $stateParams, $uibModal, $timeout) {
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
                     //$("#pblist").css('active');
          
                }
                    updateCredentialView = function () {
                        api.getProfile()
                            .then(function (prof) {
                                $scope.profile = prof;
                                return api.getCredentials();
                            })
                            .then(function (pr) {
                                $scope.credentials = pr.credentials;
                                $scope.load();
                            })
                    }
                         $scope.credEdit = function (id) {
                             $scope.recid = id;
        api.getCredential(id)
        .then(function (u) {
            $scope.rec = u;
            var r = ''
            $scope.rec.sourceNumbers.forEach(function (l) {
                r += l + ',';

            })
            $scope.rec.srcNum = r.substring(0, r.length-1);
            $scope.modal = $uibModal.open({
      animation: true,
      ariaLabelledBy: 'modal-title',
      ariaDescribedBy: 'modal-body',
      templateUrl: 'views/partials/modal-edit-credential.html',
      controller : 'UserListModalController',
     scope : $scope
    });
    $scope.modal.result.then(function (selectedItem) {
       $timeout(function () {
           updateCredentialView();
       });
    }, function () {
      console.log('but i waz dizmizeddd')
    });
        })
        
    }

          api.getProfile()
    .then(function (prof) {
        $scope.profile = prof;
    });
    api.getCredentials()
        .then(function (r){
            $scope.credentials = r.credentials;
            $scope.load();
        })

      } else {
          $location.path('/login');
      }
    
  }]);

  