//'use strict';

/**
 * @ngdoc function
 * @name billinguiApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the billinguiApp
 */
angular.module('billinguiApp')
  .controller('NewAgentController', ['$uibModal','$scope', 'api','$location', '$stateParams', '$timeout', 'Upload', 'ngProgressFactory', 'SweetAlert', function ($uibModal,$scope, api, $location, $stateParams, $timeout, Upload, ngProgressFactory, SweetAlert) {
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
          api.getProfile()
    .then(function (prof) {
        $scope.profile = prof;
        $scope.account = {};
        $scope.account.legal_type = 'company';
        $scope.availcur = [];
	$scope.currencies = [];
        $scope.load()
        if (prof.account_type == 'wholesaler') {
            $scope.distr = true;
        } else {
            $scope.distr = false;
        }
        console.log(prof);
        return api.getAccount($stateParams.id);
    })
    .then(function (acc) { 
        $scope.parent = acc;
        if (acc.type == 'wholesaler') {
            console.log('i am wholesaler')
            $scope.account.type = 'reseller';
            $scope.canCreateReseller = true;
        } else if (acc.type == 'reseller') {
            $scope.account.type = 'agent';
            $scope.canCreateReseller = false;
        } else {
            console.log('smth wrong');
        }
        return api.getRates()
    })
    .then(function (ra) {
           ra.rates.forEach(function (w) {
                            if (!$scope.availcur.contains(w.destination)) {
                                $scope.availcur.push(w.destination);
                            }
                        })
                        return api.getCurrencies();
    })
    .then(function (co) {
		co.forEach(function (co) {
            		$scope.currencies[co.symbol] = co.name;
       		 })
	})
    $scope.newAccount = function () {
         $scope.progressbar = ngProgressFactory.createInstance();
        $scope.progressbar.start();
        api.createChildAccount($stateParams.id, $scope.account)
            .then(function (aa) {
            api.updateProfile();
           $scope.progressbar.complete();
                SweetAlert.swal({
                                        title : "Good Job!",
                                        text : "Changes Saved!",
                                        type : "success",
                                        closeOnConfirm : true
                                    }, function (ok) {
                                        if (ok) {
                                            $location.path('/account/' + aa._id);
                                        }
                                        
                                    });
            })
            .catch(function (err) {
                 $scope.emsg = err.data.error.status + ' - ' + err.data.error.message;
                                    SweetAlert.swal("Oops!", "Error : " + $scope.emsg, "error");
            });
    }
      } else {
          $location.path('/login');
      }
    
  }]);
