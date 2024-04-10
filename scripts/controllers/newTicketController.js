//'use strict';

/**
 * @ngdoc function
 * @name billinguiApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the billinguiApp
 */
angular.module('billinguiApp')
  .controller('newTicketController', ['$scope', 'api','$location', '$stateParams', 'SweetAlert', '$uibModal', '$timeout', function ($scope, api, $location, $stateParams, SweetAlert, $uibModal, $timeout) {
        if (api.isAuthed()) {
            var resizePageContent = function() {
                var page            = $('#page-container');
                var pageContent     = $('#page-content');
                var header          = $('header');
                var footer          = $('#page-content + footer');
                var sidebar         = $('#sidebar');
                var sidebarAlt      = $('#sidebar-alt');
                var sScroll         = $('.sidebar-scroll');

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
                $("#newtick").css('active');
          
            }

            api.getProfile()
                .then(function (prof) {
                    $scope.profile = prof;
                    $scope.obj = {};
                    $scope.obj.priority = 'low'
                    $scope.ticket = {};
                    $scope.ticket.data = {};
                    $scope.ticket.data.requester_cc = [];

                    $scope.load();
                });

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
            $scope.newCC = function (type) {
                $scope.entry = null;
                $scope.entrytype = type;
                $scope.baa = {};
                $scope.baa.uemail = null;
                $scope.modal = $uibModal.open({
                    animation: true,
                    ariaLabelledBy: 'modal-title',
                    ariaDescribedBy: 'modal-body',
                    templateUrl: 'views/partials/modal-new-cc.html',
                    controller : 'UserModalController',
                    scope : $scope,
                    resolve: {
                        items: function() {
                            return {
                                id: $stateParams.id
                            }
                        }
                    }
                });
                $scope.modal.result.then(function (selectedItem) {
                }, function () {
                    console.log('but i waz dizmizeddd')
                });
            }

            $scope.removeCC = function (type, email) {
                if (type == 'requester') {
                    $scope.ticket.data.requester_cc = $scope.ticket.data.requester_cc.filter(function (e) { return e !== email})
                } else if (type == 'agent') {
                    $scope.ticket.data.agent_cc = $scope.ticket.data.agent_cc.filter(function (e) { return e !== email})
                }
            }
            $scope.createTicket = function () {
                $scope.obj.requester_cc = $scope.ticket.data.requester_cc;
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

  