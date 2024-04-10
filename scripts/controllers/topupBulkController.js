//'use strict';

/**
 * @ngdoc function
 * @name billinguiApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the billinguiApp
 */
angular.module('billinguiApp')
  .controller('topupBulkController', ['$scope', 'api','$location', '$stateParams', '$uibModal', '$timeout', 'ngProgressFactory', 'SweetAlert', function ($scope, api, $location, $stateParams, $uibModal, $timeout, ngProgressFactory, SweetAlert) {
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
                     $("#appposbulk").css('active');
          
                }
                $scope.resetProduct = function () {
                    $scope.step = 1;
                    $scope.canBuy = true;
                $scope.err = false;
                $scope.response = {};
                $scope.m = {};
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

        $scope.msarrArray = $scope.m.msarr.split("\n");
        $scope.progressbar = ngProgressFactory.createInstance();
        console.log('MSA', $scope.msarrArray);
        var obj = {
            numbers : $scope.msarrArray
        }
        if ($scope.msarrArray.length > 1) {
            $scope.progressbar.start();
            $scope.err = false;
            api.getProductsBulk(obj)
                .then(function (d) {
                    $scope.step = 2;
                    $scope.response = d.response;
                    $scope.response.forEach(function (z) {
                        z.prod = ''
                    })
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
    $scope.startProcessing = function () {
        if ($scope.canBuy) {

        
        $scope.progressbar.start();
        $scope.canBuy = false;
        $scope.sendObj = {};
        $scope.sendObj.numbers = [];
        console.log($scope.response)
        $scope.response.forEach(function (f) {
            if (f.fixed_product) {
                var o  = {
                    product_id : f.fixed_product,
                    msisdn : f.opts.msisdn
                }
                $scope.sendObj.numbers.push(o);
            } else if (f.denomination) {
                var o = {
                    product_id : f.product_id,
                    denomination : f.denomination,
                    msisdn : f.opts.msisdn
                }
                $scope.sendObj.numbers.push(o);
            }
        })
        api.buyProductsBulk($scope.sendObj)
            .then(function (resp) {
                $scope.progressbar.complete();
                 SweetAlert.swal({
                                        title : "Good Job!",
                                        text : "We are processing your topup, you will be redirected to status page!",
                                        type : "success",
                                        closeOnConfirm : true
                                    }, function (ok) {
                                        if (ok) {
                                            $location.path('/jobs/' + resp.batchid);
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
    }
    /*
    $scope.buyProducts = function (prod) {
        $scope.data.products.forEach(function (line) {
            if (line.product_id == prod) {
                var prodArr = line.product_id.split("-");
                if (prodArr[2] == "OR") {
                    var price = $scope.obj.denomination / line.rate;
                        price = price * $scope.obj.msarrArray.length;
                    if (price > $scope.account.balance) {
                        $scope.err = false;
                        $scope.emsg = "Sorry, you don't have enough funds to perform this operation!"
                        SweetAlert.swal("Oops!", "Error : " + $scope.emsg, "error");
                    } else {
                        //we're okay
                        if ((parseInt($scope.obj.denomination) >= parseInt(line.openRangeMin)) && (parseInt($scope.obj.denomination) < parseInt(line.openRangeMax))) {
                            SweetAlert.swal({
                            title: "Are you sure?",
                            text: "You are about to buy " + $scope.obj.msarrArray.length + " x " + $scope.obj.denomination + ' ' + line.currency + ' top-up for ' + price.toFixed(2) + ' ' + $scope.account.currency,
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
                            $scope.obj.product_id = line.product_id;
                            $scope.progressbar.start();
                            $scope.canBuy = false;
                             var oo = {};
                            oo.product_id = $scope.obj.product_id;
                            oo.denomination = $scope.obj.denomination;
                            oo.numbers = $scope.obj.msarrArray;
                            api.buyProductsBulk(oo)
                                .then(function (resp) {
                                    $scope.progressbar.complete();
                                    SweetAlert.swal({
                                        title : "Good Job!",
                                        text : "We are processing your topup, you will be redirected to status page!",
                                        type : "success",
                                        closeOnConfirm : true
                                    }, function (ok) {
                                        if (ok) {
                                            $location.path('/jobs/' + resp.jobid);
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
                    }
                } else {
                    //fixed
                    SweetAlert.swal({
                            title: "Are you sure?",
                            text: "You are about to buy " + $scope.obj.msarrArray.length + " x " + line.denomination + ' ' + line.currency + ' top-up for ' + line.price + ' ' + $scope.account.currency,
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
                            var oo = {};
                            oo.product_id = $scope.obj.product_id;
                            oo.denomination = $scope.obj.denomination;
                            oo.numbers = $scope.obj.msarrArray;
                            api.buyProductsBulk(oo)
                                .then(function (resp) {
                                    $scope.progressbar.complete();
                                    SweetAlert.swal({
                                        title : "Good Job!",
                                        text : "WWe are processing your topup, you will be redirected to status page!",
                                        type : "success",
                                        closeOnConfirm : true
                                    }, function (ok) {
                                        if (ok) {
                                            $location.path('/jobs/' + resp.jobid);
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
*/
      } else {
          $location.path('/login');
      }
    
  }]);

  
