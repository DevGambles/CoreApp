//'use strict';

/**
 * @ngdoc function
 * @name billinguiApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the billinguiApp
 */
angular.module('billinguiApp')
  .controller('topupController', ['$scope', 'api','$location', '$stateParams', '$uibModal', '$timeout', 'ngProgressFactory', 'SweetAlert', '$rootScope', function ($scope, api, $location, $stateParams, $uibModal, $timeout, ngProgressFactory, SweetAlert, $rootScope) {
      if (api.isAuthed()) {
          $scope.canBuy = true;
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
                  var link = $("#home");
        var upSpeed     = 250;
        var downSpeed   = 250;
                    link.addClass('open').next().slideDown(downSpeed);
                    // Resize #page-content to fill empty space if exists
                    setTimeout(resizePageContent, ((upSpeed > downSpeed) ? upSpeed : downSpeed));
                     $("#apppos").css('active');
          
                }
                $scope.resetProduct = function () {
                    $scope.step = 1;
                    $scope.canBuy = true;
                $scope.err = false;
                $scope.obj = {};
		$scope.obj.fixprice = 0;
                $scope.obj.msisdn = '';
                $scope.obj.denomination = 0;
                $scope.obj.price = 0;
                $scope.obj.send_sms = false;
                $scope.obj.sms_text = '';
                $scope.override = false;
                $scope.obj.override_operator = null;
                api.getProfile()
    .then(function (prof) {
        $scope.profile = prof;
        return api.getAccount(prof.main_account);
    })
    .then(function (acc) {
        $scope.account = acc;
    })
                }
                $scope.resetProduct();
          api.getProfile()
    .then(function (prof) {
        $scope.profile = prof;
        return api.getAccount(prof.main_account);
    })
    .then(function (acc) {
        $scope.account = acc;
    })
    $scope.getProducts = function () {
        $scope.progressbar = ngProgressFactory.createInstance();

        if ($scope.obj.msisdn.length > 5) {
            $scope.progressbar.start();
            $scope.err = false;
            api.getProducts($scope.obj.msisdn)
                .then(function (d) {
                    $scope.step = 2;
                    $scope.data = d;
                    $scope.progressbar.complete();
                })
                .catch(function (err) {
                   $scope.progressbar.complete();
                                        $scope.err = true;
                    $scope.emsg = err.data.message;
                })
        } else {
            $scope.err = true;
            $scope.emsg = 'Please Input correct number!'
        }
    }
    $scope.doOverride = function () {
        api.getOperators($scope.data.opts.iso.toLowerCase())
            .then(function (ops) {
                console.log(ops);
                $scope.override = true;
                $scope.operators = ops;
            })
    }
    $scope.buyProducts = function (prod) {
        $scope.data.products.forEach(function (line) {
            if (line.product_id == prod) {
                var prodArr = line.product_id.split("-");
                if (prodArr[2] == "OR") {
                    var price = $scope.obj.denomination / line.rate;
                        //we're okay
                        if ((parseInt($scope.obj.denomination) >= parseInt(line.openRangeMin)) && (parseInt($scope.obj.denomination) < parseInt(line.openRangeMax))) {
                            SweetAlert.swal({
                            title: "Are you sure?",
                            text: "You are about to buy " + $scope.obj.denomination + ' ' + line.topup_currency + ' top-up for ' + price.toFixed(2) + ' ' + line.currency,
                            type: "warning",
                            showCancelButton: true,
                            confirmButtonColor: "#578022",
                            confirmButtonText: "Yes, go ahead!",
                            closeOnConfirm: false}, 
                            function(isConfirm){ 

                                if (isConfirm) {
                                    if ($scope.canBuy) {
                                         $scope.err = false;
                            $scope.obj.denomination = parseInt($scope.obj.denomination)
                            if ($scope.override == true) {
                                $scope.obj.product_id = prodArr[0] + '-' + $scope.obj.override_operator + '-' + prodArr[2];
                            } else {
                                $scope.obj.product_id = line.product_id;
                            }
                            
                            $scope.progressbar.start();
                            $scope.canBuy = false;
                            api.buyProducts($scope.obj.msisdn, $scope.obj)
                                .then(function (resp) {
                                    $scope.progressbar.complete();
                                    SweetAlert.swal({
                                        title : "Good Job!",
                                        text : "You have successfully topped up +" + $scope.obj.msisdn + "!",
                                        type : "success",
                                        closeOnConfirm : true
                                    }, function (ok) {
                                        if (ok) {
                                            $scope.step = 3;
                                            $scope.res = resp;
                                            $rootScope.updateBalance()
                                        }
                                        
                                    });
                                })
                                .catch(function (er) {
                                    $scope.progressbar.complete();
                                    console.log(er);
                                    $scope.emsg = er.data.status + ' - ' + er.data.message;
                                    SweetAlert.swal("Oops!", "Error : " + $scope.emsg, "error");
                                })
                                    }
                                   
                                } else {

                                }
                                
                            });
                            
                        } else {
                            $scope.err = false;
                            $scope.emsg = "Sorry, The Amount you have chosen is not supported by our system!"
                            SweetAlert.swal("Oops!", "Error : " + $scope.emsg, "error");
                        }
                    
                } else {
                    //fixed
                    SweetAlert.swal({
                            title: "Are you sure?",
                            text: "You are about to buy " + line.denomination + ' ' + line.topup_currency + ' top-up for ' + line.price + ' ' + line.currency,
                            type: "warning",
                            showCancelButton: true,
                            confirmButtonColor: "#578022",
                            confirmButtonText: "Yes, go ahead!",
                            closeOnConfirm: false}, 
                            function(isConfirm){ 
                                if (isConfirm) {
                                    if ($scope.canBuy) {
                                         $scope.err = false;
                            $scope.obj.denomination = line.denomination
                            $scope.obj.product_id = line.product_id;
                            $scope.progressbar.start();
                            $scope.canBuy = false;
                            api.buyProducts($scope.obj.msisdn, $scope.obj)
                                .then(function (resp) {
                                    $scope.progressbar.complete();
                                    SweetAlert.swal({
                                        title : "Good Job!",
                                        text : "You have successfully topped up +" + $scope.obj.msisdn + "!",
                                        type : "success",
                                        closeOnConfirm : true
                                    }, function (ok) {
                                        if (ok) {
                                            $scope.step = 3;
                                            $scope.res = resp;
                                        }
                                        
                                    });
                                })
                                .catch(function (er) {
                                    $scope.progressbar.complete();
                                    console.log(er);
                                    $scope.emsg = er.data.status + ' - ' + er.data.message;
                                    SweetAlert.swal("Oops!", "Error : " + $scope.emsg, "error");
                                })
                                    } else {

                                    }
                                   
                                } else {

                                }
                                
                            });
                }
            }
        })
    }

      } else {
          $location.path('/login');
      }
    
  }])
.directive("ngMobileClick", [function () {
    return function (scope, elem, attrs) {
        elem.bind("touchstart click", function (e) {
            e.preventDefault();
            e.stopPropagation();

            scope.$apply(attrs["ngMobileClick"]);
        });
    }
}])

   angular.module('billinguiApp')
    .controller('topupModalController', ['$uibModalInstance', '$scope', 'api', '$stateParams', 'Upload', function($uibModalInstance, $scope, api, $stateParams, Upload) {
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
