//'use strict';

/**
 * @ngdoc function
 * @name billinguiApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the billinguiApp
 */
angular.module('billinguiApp')
  .controller('InvoiceEditController', ['$scope', 'api','$location', '$stateParams', '$timeout', '$uibModal', function ($scope, api, $location, $stateParams, $timeout, $uibModal) {
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
                  $("#inv").addClass(".active");
        var upSpeed     = 250;
        var downSpeed   = 250;
                    link.addClass('open').next().slideDown(downSpeed);
                    // Resize #page-content to fill empty space if exists
                    setTimeout(resizePageContent, ((upSpeed > downSpeed) ? upSpeed : downSpeed));

          
                }
          $scope.invoice = {};
            $scope.invoice.invoice_id = '';
           
        $scope.invN = {};
        $scope.invN.line_mode = 'detailed';
        $scope.invN.disc_mode = 'pct';
        $scope.invoice.draft = "draft";
          api.getProfile()
    .then(function (prof) {
        $scope.profile = prof;
        $scope.load();
    });
    api.getAccount($stateParams.account)
        .then(function (acc) {
            $scope.account = acc;
            return api.getParent(acc._id);
        })
        .then(function (x) {
            $scope.parent = x;
        })
    api.getInvoice($stateParams.id, $stateParams.account)
        .then(function(inv) {
            
            $scope.invoice = inv;
            $scope.invoice.draft = inv.document_state;
        $scope.invoice.invoice_date = new Date(inv.invoice_date);
        $scope.invoice.invoice_due = new Date(inv.invoice_due);
         $scope.intmp = {};
        $scope.intmp.discount = parseFloat(inv.invoice_disc_amount);
        $scope.intmp.subtotal = parseFloat(inv.invoice_amount);
        $scope.intmp.tax_rate = 8;
        $scope.intmp.tax_int = $scope.intmp.tax_rate / 100;
        $scope.intmp.tax_due = 0;
        $scope.intmp.total = 0;
        inv.invoice_lines.forEach(function (f) {
            f.line_subtotal = parseFloat(f.line_subtotal);
            f.line_quantity = parseFloat(f.line_quantity);
            f.line_price = parseFloat(f.line_price);
        })
        updateTotals();
            console.log('INV :', $scope.invoice)
        })

         $scope.addLine = function () {
            var rec = {};
                if ($scope.invN.line_mode == 'detailed') {
                    rec.line_detailed = true;
                rec.line_subtotal = $scope.invN.line_quantity * $scope.invN.line_price;
            } else {
                rec.line_subtotal = $scope.invN.line_price;
                rec.line_detailed = false;
            }
            if ($scope.invN.line_discount == '') {
                rec.line_discount_pct = 0;
                rec.line_discount_amount = 0;
                rec.line_disc_txt = '-';
            } else {
                if ($scope.invN.disc_mode == 'pct') {
                    //check discount amt 0 - 100
                    if (($scope.invN.line_discount > 0) && ($scope.invN.line_discount < 101)) {
                        rec.line_discount_pct = $scope.invN.line_discount;
                        rec.line_discount_amount = 0;
                         disc_pct = rec.line_discount_pct / 100;
                            disc_amo = rec.line_subtotal * disc_pct;
                            $scope.intmp.discount = parseFloat($scope.intmp.discount) + parseFloat(disc_amo);
                            rec.line_disc_txt = rec.line_discount_pct + '%';
                    } else {
                        rec.line_discount_pct = 0;
                        rec.line_discount_amount = 0;
                        rec.line_disc_txt = '-';
                    }
                } else {
                    //amt
                    if (($scope.invN.line_discount > 0)) {
                        rec.line_discount_amount = $scope.invN.line_discount;
                        rec.line_discount_pct = 0;
                        $scope.intmp.discount = parseFloat($scope.intmp.discount) + parseFloat(rec.line_discount_amount);
                        rec.line_disc_txt = '¥' + rec.line_discount_amount;
                    } else {
                        rec.line_discount_amount = 0;
                        rec.line_discount_pct = 0;
                        rec.line_disc_txt = '-';
                    }
                }
            }
            rec.line_number = $scope.curLineIndex;
            rec.line_description = $scope.invN.line_description;
            rec.line_quantity = $scope.invN.line_quantity;
            rec.line_price = $scope.invN.line_price;
            $scope.intmp.subtotal = $scope.intmp.subtotal + rec.line_subtotal;
            
            
            $scope.invoice.invoice_lines.push(rec);
            $scope.invN.line_description = '';
            $scope.invN.line_quantity = '';
            $scope.invN.line_price = '';
            $scope.invN.line_discount = '';
            $scope.curLineIndex++;
            console.log($scope.invoice);
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
        $scope.editCancel = function () {
            delete $scope.invN;
            $scope.invN = {};
            $scope.invN.line_mode = 'detail';
            $scope.invN.disc_mode = 'pct';
            $scope.editing = false;

        }
        $scope.editLine = function (id) {
            var iid = id - 1;
            $scope.invN = $scope.invoice.invoice_lines[iid];
              
            if ($scope.invN.line_detailed) {
                $scope.invN.line_mode = 'detailed';
            } else {
                $scope.invN.line_mode = 'brief';
            }
            if ($scope.invN.line_discount_pct > 0) {
                $scope.invN.disc_mode = 'pct';
                $scope.invN.line_discount = $scope.invN.line_discount_pct;
            } else {
                $scope.invN.disc_mode = 'amt';
                $scope.invN.line_discount = $scope.invN.line_discount_amount;
            }
            $scope.editing = true;
        }
        var updateTotals = function () {
       $scope.intmp.discount = 0;
        $scope.intmp.subtotal = 0;
        $scope.intmp.tax_rate = 8;
        $scope.intmp.tax_int = $scope.intmp.tax_rate / 100;
        $scope.intmp.tax_due = 0;
        $scope.intmp.total = 0;
            $scope.invoice.invoice_lines.forEach(function (l) {
                console.log('LINE :', l);
                $scope.intmp.subtotal = parseFloat($scope.intmp.subtotal) + parseFloat(l.line_subtotal);
                console.log('LDISCPCT :', l.line_discount_pct);
                if ((l.line_discount_pct > 0) && (l.line_discount_pct < 101)) {
                    var disc_int = l.line_discount_pct / 100;
                    var disc_amo = parseInt(l.line_subtotal) * parseFloat(disc_int);
                    $scope.intmp.discount = parseInt($scope.intmp.discount) + parseInt(disc_amo);
                    console.log('INTMPDISC :', disc_amo)
                } else if (l.line_discount_amount > 0) {
                    $scope.intmp.discount = parseInt($scope.intmp.discount) + parseInt(l.line_discount_amount);
                } else {

                }
                console.log('INV :', $scope.intmp)
            });
        }
        var recalcLines = function () {
            var i = 1;
            if ($scope.invoice.invoice_lines.length > 0) {
                     $scope.invoice.invoice_lines.forEach(function (l) {
                l.line_number = i;
                i++;
            })
            } else {
                delete $scope.invoice.invoice_lines;
                $scope.invoice.invoice_lines = [];
            }
           
        }    
        $scope.editLineAct = function (id) {
            var iid = id -1;
            console.log('INVN: ', $scope.invN);
            $scope.invoice.invoice_lines[iid].line_description  =$scope.invN.line_description;
            if ($scope.invN.line_mode == 'detailed') {
                $scope.invoice.invoice_lines[iid].line_quantity = $scope.invN.line_quantity;
                $scope.invoice.invoice_lines[iid].line_price = $scope.invN.line_price;
                $scope.invoice.invoice_lines[iid].line_subtotal = $scope.invoice.invoice_lines[iid].line_quantity * $scope.invoice.invoice_lines[iid].line_price;
            } else {
                $scope.invoice.invoice_lines[iid].line_quantity = 0;
                $scope.invoice.invoice_lines[iid].line_price = $scope.invN.line_price;
                $scope.invoice.invoice_lines[iid].line_subtotal = $scope.invoice.invoice_lines[iid].line_price;
            }
            if ($scope.invN.disc_mode == 'pct') {
                    if (($scope.invN.line_discount > 0) && ($scope.invN.line_discount < 101)) {
                        $scope.invoice.invoice_lines[iid].line_discount_pct = $scope.invN.line_discount;
                        $scope.invoice.invoice_lines[iid].line_disc_txt = $scope.invN.line_discount + '%';
                    } else {
                        $scope.invoice.invoice_lines[iid].line_discount_pct = 0;
                        $scope.invoice.invoice_lines[iid].line_disc_txt = '-';
                    }
                $scope.invoice.invoice_lines[iid].line_discount_amount = 0;

            } else {
                if ($scope.invN.line_discount > 0) {
                    $scope.invoice.invoice_lines[iid].line_discount_amount = $scope.invN.line_discount;
                    $scope.invoice.invoice_lines[iid].line_discount_pct = 0;
                    $scope.invoice.invoice_lines[iid].line_disc_txt = '¥' + $scope.invN.line_discount;
                } else {
                    $scope.invoice.invoice_lines[iid].line_discount_amount = 0;
                    $scope.invoice.invoice_lines[iid].line_discount_pct = 0;
                    $scope.invoice.invoice_lines[iid].line_disc_txt = '-';
                }
            }
            console.log('IID :', $scope.invoice.invoice_lines[iid]);
            updateTotals();
            delete $scope.invN;
            $scope.invN = {};
            $scope.invN.line_mode = 'detail';
            $scope.invN.disc_mode = 'pct';
            $scope.editing = false;

        }
        $scope.deleteLine = function (id) {
            var iid = id - 1;
            $scope.invoice.invoice_lines.splice(iid, 1);
            updateTotals();
            recalcLines();
        }
        $scope.saveInvoice = function () {
            $scope.invoice.draft = true;
            $scope.invoice.invoice_type = 'inv';
            $scope.invoice.invoice_tax_pct = 8;
            api.editInvoice($stateParams.account, $stateParams.id, $scope.invoice)
                .then(function(i) {
                    $location.path('/account/' + $stateParams.account + '/invoices/' + i._id)
                })
        }
        $scope.finalizeInvoice = function () {
            $scope.modal = $uibModal.open({
            animation: true,
            ariaLabelledBy: 'modal-title',
            ariaDescribedBy: 'modal-body',
            templateUrl: 'views/partials/modal-finalize-invoice.html',
            controller : 'InvoiceModalController',
            scope : $scope
            });
            $scope.modal.result.then(function (selectedItem) {
            $timeout(function () {
                $location.path('/account/' + $stateParams.account + '/invoices/' + $stateParams.id);
            });
            }, function () {
            console.log('but i waz dizmizeddd')
            });
        }

      } else {
          $location.path('/login');
      }
    
  }]);


angular.module('billinguiApp')
    .controller('InvoiceModalController', ['$uibModalInstance', '$scope', 'api', '$stateParams', '$location', function($uibModalInstance, $scope, api, $stateParams, $location) {

        $scope.cancel = function () {
            $uibModalInstance.dismiss();
        }
        $scope.finalizeOK = function () {
            $scope.invoice.draft = false;
            api.editInvoice($stateParams.account, $stateParams.id, $scope.invoice)
                .then(function (f) {
                    $uibModalInstance.close();
                })
        }
        $scope.markOK = function () {
            if ($scope.newstate == 'void') {
                api.deleteInvoice($stateParams.account, $stateParams.id)
                    .then(function (f) {
                        $uibModalInstance.close();
                    })
                    .catch(function (err) {
                        $uibModalInstance.dismiss(err);
                    })
            } else {
                $scope.invoice.invoice_status = $scope.newstate;
                api.editInvoice($stateParams.account, $stateParams.id, $scope.invoice)
                    .then(function (f) {
                        $uibModalInstance.close();
                    })
                    .catch(function (err) {
                        $uibModalInstance.dismiss(err);
                    })
            }
        }

    }]);