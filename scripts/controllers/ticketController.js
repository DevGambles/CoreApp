//'use strict';

/**
 * @ngdoc function
 * @name billinguiApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the billinguiApp
 */
angular.module('billinguiApp')
  .controller('TicketController', ['$scope', 'api','$location', '$stateParams', 'SweetAlert', function ($scope, api, $location, $stateParams, SweetAlert) {
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
                  var link = $("#subAA");
        var upSpeed     = 250;
        var downSpeed   = 250;
                    link.addClass('open').next().slideDown(downSpeed);
                    // Resize #page-content to fill empty space if exists
                    setTimeout(resizePageContent, ((upSpeed > downSpeed) ? upSpeed : downSpeed));
                     $("#ticklist").css('active');
          
                }
       api.getProfile()
    .then(function (prof) {
        $scope.profile = prof;
        return api.getTicket($stateParams.id);
    })
    .then(function (ticket) {
        console.log(ticket)
        $scope.ticket = ticket;
        if ($scope.profile.account_type !== 'agent') {
            return api.getAccount(ticket.data.account);
        }
    })
    .then(function (acc) {
        if ($scope.profile.account_type !== 'agent') {
            $scope.account = acc;
            acc.wallets.forEach(function (w) {
                if (w.primary === true) {
                    $scope.account.priwal = w;
                }
            })
            return api.getTopupsAcc(acc._id, 1)
        }
    })
    .then(function (tl) {
        if ($scope.profile.account_type !== 'agent') {
            $scope.tl = tl.docs;
            return api.getTransactions($scope.account._id, 1);
        }
    })
    .then(function (tx) {
        if ($scope.profile.account_type !== 'agent') {
            $scope.tx = tx.docs;
        }
    })
        $scope.updateTicketView = function () {
         api.getProfile()
    .then(function (prof) {
        $scope.profile = prof;
        return api.getTicket($stateParams.id);
    })
    .then(function (ticket) {
        console.log(ticket)
        $scope.ticket = ticket;
        if ($scope.profile.account_type !== 'agent') {
            return api.getAccount(ticket.account);
        }
    })
   .then(function (acc) {
        if ($scope.profile.account_type !== 'agent') {
            $scope.account = acc;
            acc.wallets.forEach(function (w) {
                if (w.primary === true) {
                    $scope.account.priwal = w;
                }
            })
            return api.getTopupsAcc(acc._id, 1)
        }
    })
    .then(function (tl) {
        if ($scope.profile.account_type !== 'agent') {
            $scope.tl = tl.docs;
            return api.getTransactions($scope.account._id, 1);
        }
    })
    .then(function (tx) {
        if ($scope.profile.account_type !== 'agent') {
            $scope.tx = tx.docs;
        }
    })
    }
    $scope.updateAccountView = function () {
        api.getAccounts()
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
    $scope.updateTicket = function () {
        api.updateTicket($stateParams.id, $scope.ticket.data)
            .then(function (upd) {
                 SweetAlert.swal({
                                        title : "Good Job!",
                                        text : "Your ticket with id #" + upd.ticket_id + " was successfully updated!",
                                        type : "success",
                                        closeOnConfirm : true
                                    }, function (ok) {
                                        if (ok) {
                                            $scope.updateTicketView();
                                        }
                                        
                                    });
            })
    }
    $scope.createTicket = function () {
        api.createTicket($scope.obj)
            .then(function (ti) {
                SweetAlert.swal({
                                        title : "Good Job!",
                                        text : "Your ticket with id #" + ti.ticket_id + " was successfully created!",
                                        type : "success",
                                        closeOnConfirm : true
                                    }, function (ok) {
                                        if (ok) {
                                            $location.path('/tickets/' + ti._id);
                                        }
                                        
                                    });
            })
    }
      } else {
          $location.path('/login');
      }
    
  }]);

  