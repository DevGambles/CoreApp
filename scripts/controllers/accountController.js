//'use strict';

/**
 * @ngdoc function
 * @name billinguiApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the billinguiApp
 */


angular.module('billinguiApp')
    .controller('AccountController', ['$uibModal', '$scope', 'api', '$location', '$stateParams', '$timeout', 'Upload', 'ngProgressFactory', 'SweetAlert', '$rootScope', '$window', function ($uibModal, $scope, api, $location, $stateParams, $timeout, Upload, ngProgressFactory, SweetAlert, $rootScope, $window) {
        if (api.isAuthed()) {

            $scope.country_currency = {
                ar: 'ARS',
                bd: 'BDT',
                af: 'AFN',
                ag: 'XCD',
                ai: 'XCD',
                bb: 'BBD',
                bj: 'XOF',
                bo: 'undefined',
                bm: 'BMD',
                br: 'BRL',
                bw: 'BWP',
                vg: 'USD',
                bf: 'XOF',
                kh: 'KHR',
                cm: 'XAF',
                cn: 'CNY',
                co: 'COU',
                cr: 'CRC',
                cy: 'EUR',
                cd: 'CDF',
                cu: 'CUC',
                dm: 'XCD',
                do: 'DOP',
                eg: 'EGP',
                ec: 'USD',
                sv: 'USD',
                gh: 'GHS',
                gt: 'GTQ',
                gq: 'GNF',
                id: 'IDR',
                in: 'INR',
                jm: 'JMD',
                jo: 'JOD',
                ke: 'KES',
                kg: 'KGS',
                la: 'LAK',
                lr: 'LRD',
                mg: 'MGA',
                my: 'MYR',
                ml: 'XOF',
                mx: 'MXN',
                md: 'MDL',
                ms: 'XCD',
                np: 'NPR',
                ma: 'MAD',
                mz: 'MZN',
                ni: 'NIO',
                ne: 'XOF',
                ng: 'NGN',
                pk: 'PKR',
                pa: 'USD',
                py: 'PYG',
                pe: 'PEN',
                ph: 'PHP',
                pl: 'PLN',
                ro: 'RON',
                ru: 'RUB',
                sn: 'XOF',
                rw: 'RWF',
                sl: 'SLL',
                sg: 'SGD',
                za: 'ZAR',
                es: 'EUR',
                sz: 'SZL',
                lk: 'LKR',
                tz: 'TZS',
                tk: 'TJS',
                th: 'THB',
                tt: 'TTD',
                tr: 'TRY',
                tn: 'TND',
                tc: 'USD',
                ug: 'UGX',
                ua: 'UAH',
                uy: 'UYU',
                uz: 'UZS',
                ye: 'YER',
                zm: 'ZMW',
                zw: 'ZWL',
                sd: 'SDG',
                it: 'EUR',
                bs: 'BSD',
                at: 'EUR',
                by: 'BYR'
            }

            $scope.currencyRate = {};
            $scope.countryiso = {};
            $scope.mainWallet = '';
            $scope.subWallet = [];
            $scope.parentProfit = {};
            $scope.progressbar = ngProgressFactory.createInstance();
            $scope.progressbar.start();

            var resizePageContent = function () {
                page = $('#page-container');
                pageContent = $('#page-content');
                header = $('header');
                footer = $('#page-content + footer');
                sidebar = $('#sidebar');
                sidebarAlt = $('#sidebar-alt');
                sScroll = $('.sidebar-scroll');

                var windowH = $(window).height();
                var sidebarH = sidebar.outerHeight();
                var sidebarAltH = sidebarAlt.outerHeight();
                var headerH = header.outerHeight();
                var footerH = footer.outerHeight();

                // If we have a fixed sidebar/header layout or each sidebars’ height < window height
                if (header.hasClass('navbar-fixed-top') || header.hasClass('navbar-fixed-bottom') || ((sidebarH < windowH) && (sidebarAltH < windowH))) {
                    if (page.hasClass('footer-fixed')) { // if footer is fixed don't remove its height
                        pageContent.css('min-height', windowH - headerH + 'px');
                    } else { // else if footer is static, remove its height
                        pageContent.css('min-height', windowH - (headerH + footerH) + 'px');
                    }
                } else { // In any other case set #page-content height the same as biggest sidebar's height
                    if (page.hasClass('footer-fixed')) { // if footer is fixed don't remove its height
                        pageContent.css('min-height', ((sidebarH > sidebarAltH) ? sidebarH : sidebarAltH) - headerH + 'px');
                    } else { // else if footer is static, remove its height
                        pageContent.css('min-height', ((sidebarH > sidebarAltH) ? sidebarH : sidebarAltH) - (headerH + footerH) + 'px');
                    }
                }
            };
            $scope.load = function () {
                var link = $("#account");

                var upSpeed = 250;
                var downSpeed = 250;
                link.addClass('open').next().slideDown(downSpeed);
                // Resize #page-content to fill empty space if exists
                setTimeout(resizePageContent, ((upSpeed > downSpeed) ? upSpeed : downSpeed));
                $("#acclist").css('active');
              //  api.getRates()
                   // .then(function (ret) {
                       
                        var allrates = JSON.parse($window.localStorage['rates']);
                        for (var i = 0; i < allrates.count; i++) {
                            if (allrates.rates[i].source == 'USD') {
                                $scope.currencyRate[allrates.rates[i].destination] = allrates.rates[i].rate;
                            }
                        }
                   // })
            }
            var updateProfileView = function () {
                api.getProfile()
                    .then(function (prof) {
                        $scope.currentRate = 0;
                        $scope.profile = prof;
                        $scope.load();

                        if (prof.account_type == 'wholesaler') {
                            $scope.distr = true;
                        } else {
                            $scope.distr = false;
                        }
                        $scope.progressbar.complete();
                        
                        if($scope.profile.main_account==$stateParams.id){
                            return api.getTopupsAcc($stateParams.id, $scope.page);
                        }
                        else{
                            $scope.filter = {
                                date_from: '',
                                time_from: '',
                                date_to: '',
                                time_to: '',
                                timezone: '',
                                account: $stateParams.id,
                                customer_reference: '',
                                operator_reference: '',
                                success: '',
                                code: '',
                                product_id: '',
                                target: '',
                                country: '',
                                operator_name: '',
                                channel: '',
                                vnd_sim: '',
                                api_transactionid: '',
                                currency: ''
                            }
                            var filterparam = $scope.filter;
                            return api.getTopupsFilter(filterparam, $scope.page)
                        }

                        
                    })
                    .then(function(c){
                        $scope.data = c.docs;
                        $scope.account_names = [];
            $scope.anames = JSON.parse($window.localStorage['acnames']);
            $scope.anames.forEach(function (line) {
                $scope.account_names[line._id] = line.account_name;
            })
                        $scope.load();
                    })
                    .catch(function (err) {
                        console.log(err);
                    });
            }
            updateProfileView();
            var getParent = function (id) {
                api.getParent(id)
                    .then(function (a) {
                        $scope.parent = a;
                    })
            }

            var updateAccountView = function () {
                api.getAccount($stateParams.id)
                    .then(function (acc) {
                        $scope.accounts = JSON.parse($window.localStorage['acnames']);
                        $scope.account = {};
                        $scope.account.permitted_apis = [];
                        $scope.account = acc;
                        $scope.account.parent_name = '';
                        if ('undefined' == typeof $scope.account.show_tag_balance) {
                            $scope.account.show_tag_balance = false;
                            $scope.account.show_tag = '';
                            $scope.account.balance_type = 'compact';
                        }
                        if($scope.profile.main_account == $scope.account.parent){
                            api.getAccount($scope.profile.main_account)
                            .then(function(mainacc){
                                $scope.account.parent_name = mainacc.account_name;
                            })
                        }
                        for(var i =0 ;i<$scope.accounts.length;i++){
                            if($scope.accounts[i]._id === $scope.account.parent){
                                $scope.account.parent_name = $scope.accounts[i].account_name;
                            }
                        }
                        for (var i = 0; i < $scope.account.wallets.length; i++) {
                            if ($scope.account.wallets[i].primary == true) {
                                $scope.mainWallet = $scope.account.wallets[i].currency;
                            } else {
                                $scope.subWallet.push($scope.account.wallets[i].currency);
                            }
                        }
                        if ($scope.account.features_enabled.contains('epin')) {
                            $scope.epin_enabled = true;
                        } else {
                            $scope.epin_enabled = false;
                        }
                        $scope.resetAcl();
                        $scope.resetProfitMap();
                        $scope.currencies = JSON.parse($window.localStorage['currencies']);
                    })
                   
            }
            
            $scope.page = 1;
            updateAccountView();
            var updateTransactionView = function () {
                var page = $scope.page;
                api.getTransactions($stateParams.id, $scope.page)
                    .then(function (i) {
                        $scope.transactions = i.docs;
                    })

            }

            var updateTopuplogsView = function () {
                api.getTopupsAcc($stateParams.id, $scope.page)
                    .then(function (c) {
                        $scope.data = c.docs;
                    })

            }

            var updateUserView = function () {
                api.getAccountUsers($stateParams.id)
                    .then(function (users) {
                        $scope.users = users.users;
                    });
            }

            var updateChildView = function () {
                api.getChildAccounts($stateParams.id)
                    .then(function (accounts) {
                        $scope.children = accounts.accounts;
                    });
            }

            var updateCredentialView = function () {
                api.getCredentialsAccount($stateParams.id)
                    .then(function (cred) {
                        $scope.credentials = cred.credentials;
                    })
            }
            var updateDFRView = function () {
                api._get('/accounts/' + $stateParams.id + '/drules')
                    .then(function (d) {
                        $scope.drules = d.rulesets;
                        return api._get('/accounts/' + $stateParams.id + '/frules')
                    })
                    .then(function (u) {
                        $scope.frules = u.rulesets;
                    })
            }
            $scope.changePage = function (page) {
                $scope.page = page;
            }

            /***********DFR DFR DFR */
            $scope.newDRule = function () {
                $scope.rec = {};
                $scope.rec.rules = [];
                $scope.rec.isSystemWide = false;
                $scope.nrule = {};

                $scope.modal = $uibModal.open({
                    animation: true,
                    ariaLabelledBy: 'modal-title',
                    ariaDescribedBy: 'modal-body',
                    templateUrl: 'views/partials/modal-new-drule.html',
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
                    $timeout(function () {
                        updateDFRView();
                    });
                    }, function () {
                    console.log('but i waz dizmizeddd')
                    });
            }
            $scope.newFRule = function () {
                $scope.rec = {};
                $scope.rec.rules = [];
                $scope.rec.isSystemWide = false;
                $scope.nrule = {};

                $scope.modal = $uibModal.open({
                    animation: true,
                    ariaLabelledBy: 'modal-title',
                    ariaDescribedBy: 'modal-body',
                    templateUrl: 'views/partials/modal-new-frule.html',
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
                    $timeout(function () {
                        updateDFRView();
                    });
                }, function () {
                    console.log('but i waz dizmizeddd')
                });
            }
            $scope.drEdit = function (id) {
                $scope.recid = id;
                api._get('/accounts/' + $stateParams.id + '/drules/' + id)
                    .then(function (u) {
                        $scope.rec = u;

                        $scope.modal = $uibModal.open({
                            animation: true,
                            ariaLabelledBy: 'modal-title',
                            ariaDescribedBy: 'modal-body',
                            templateUrl: 'views/partials/modal-edit-drule.html',
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
                            $timeout(function () {
                                updateDFRView();
                            });
                        }, function () {
                            console.log('but i waz dizmizeddd')
                        });
                    })
            }

            $scope.drDelete = function (id) {
                $scope.recid = id;
                api._get('/accounts/' + $stateParams.id + '/drules/' + id)
                    .then(function (u) {
                        $scope.rec = u;

                        $scope.modal = $uibModal.open({
                            animation: true,
                            ariaLabelledBy: 'modal-title',
                            ariaDescribedBy: 'modal-body',
                            templateUrl: 'views/partials/modal-delete-drule.html',
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
                            $timeout(function () {
                                updateDFRView();
                            });
                        }, function () {
                            console.log('but i waz dizmizeddd')
                        });
                    })
            }

            $scope.frEdit = function (id) {
                $scope.recid = id;
                api._get('/accounts/' + $stateParams.id + '/frules/' + id)
                    .then(function (u) {
                        $scope.rec = u;

                        $scope.modal = $uibModal.open({
                            animation: true,
                            ariaLabelledBy: 'modal-title',
                            ariaDescribedBy: 'modal-body',
                            templateUrl: 'views/partials/modal-edit-frule.html',
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
                            $timeout(function () {
                                updateDFRView();
                            });
                        }, function () {
                            console.log('but i waz dizmizeddd')
                        });
                    })
            }

            $scope.frDelete = function (id) {
                $scope.recid = id;
                api._get('/accounts/' + $stateParams.id + '/frules/' + id)
                .then(function (u) {
                    $scope.rec = u;

                    $scope.modal = $uibModal.open({
                        animation: true,
                        ariaLabelledBy: 'modal-title',
                        ariaDescribedBy: 'modal-body',
                        templateUrl: 'views/partials/modal-delete-frule.html',
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
                        $timeout(function () {
                            updateDFRView();
                        });
                    }, function () {
                        console.log('but i waz dizmizeddd')
                    });
                })
            }

            /***********DFR DFR DFR */
            $scope.newWallet = function () {
                $scope.rec = {};
                $scope.rec.currency = 'USD'
                $scope.rec.wallet_name = ''
                $scope.availcur = [];
                api.getRates()
                    .then(function (ra) {
                        ra.rates.forEach(function (w) {
                            if (!$scope.availcur.contains(w.destination)) {
                                $scope.availcur.push(w.destination);
                            }
                        })
                        $scope.modal = $uibModal.open({
                            animation: true,
                            ariaLabelledBy: 'modal-title',
                            ariaDescribedBy: 'modal-body',
                            templateUrl: 'views/partials/modal-new-wallet.html',
                            controller: 'UserModalController',
                            scope: $scope,
                            resolve: {
                                items: function() {
                                    return {
                                        id: $stateParams.id
                                    }
                                }
                            }
                        });
                        $scope.modal.result.then(function (selectedItem) {
                            $timeout(function () {
                                updateAccountView()
                                $rootScope.updateBalance()
                                SweetAlert.swal({
                                    title: "Good Job!",
                                    text: "Wallet has been created!",
                                    type: "success",
                                    closeOnConfirm: true
                                }, function (ok) {
                                    if (ok) {

                                    }

                                });
                            });
                        }, function (err) {
                            if (err !== null) {
                                $scope.emsg = err.data.status + ' - ' + err.data.message;
                                SweetAlert.swal("Oops!", "Error : " + $scope.emsg, "error");
                            }
                        });
                    })

            }
            $scope.newPA = function () {
                $scope.baa = {};
                $scope.baa.apid = null;
                $scope.modal = $uibModal.open({
                    animation: true,
                    ariaLabelledBy: 'modal-title',
                    ariaDescribedBy: 'modal-body',
                    templateUrl: 'views/partials/modal-new-cc.html',
                    controller: 'UserModalController',
                    scope: $scope,
                    resolve: {
                        items: function() {
                            return {
                                id: $stateParams.id
                            }
                        }
                    }
                });
                $scope.modal.result.then(function (selectedItem) {
                    if (!$scope.account.permitted_apis.contains($scope.baa.apid)) {
                        $scope.account.permitted_apis.push($scope.baa.apid);
                    }
                }, function () {
                    console.log('but i waz dizmizeddd')
                });
            }
            $scope.newCred = function () {
                $scope.rec = {};
                $scope.modal = $uibModal.open({
                    animation: true,
                    ariaLabelledBy: 'modal-title',
                    ariaDescribedBy: 'modal-body',
                    templateUrl: 'views/partials/modal-new-credential.html',
                    controller: 'UserModalController',
                    scope: $scope,
                    resolve: {
                        items: function() {
                            return {
                                id: $stateParams.id
                            }
                        }
                    }
                });
                $scope.modal.result.then(function (selectedItem) {
                    updateCredentialView();
                }, function () {
                    console.log('but i waz dizmizeddd')
                });
            }
            $scope.removePA = function (a) {
                $scope.account.permitted_apis = $scope.account.permitted_apis.filter(function (e) {
                    return e !== a
                })
            }
            $scope.removeIP = function (a) {
                $scope.account.appfw_whitelist = $scope.account.appfw_whitelist.filter(function (e) { return e !== a})
            }
            $scope.newIP = function () {
                $scope.baa = {};
                $scope.baa.ip = null;
                $scope.modal = $uibModal.open({
                    animation: true,
                    ariaLabelledBy: 'modal-title',
                    ariaDescribedBy: 'modal-body',
                    templateUrl: 'views/partials/modal-new-ip.html',
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
                    if (!$scope.account.appfw_whitelist.contains($scope.baa.ip)) {
                        $scope.account.appfw_whitelist.push($scope.baa.ip);
                    }
                }, function () {
                    console.log('but i waz dizmizeddd')
                });
            }
            $scope.editWallet = function (id) {
                api.getWallet($scope.account._id, id)
                    .then(function (w) {
                        $scope.rec = w;
                        $scope.modal = $uibModal.open({
                            animation: true,
                            ariaLabelledBy: 'modal-title',
                            ariaDescribedBy: 'modal-body',
                            templateUrl: 'views/partials/modal-edit-wallet.html',
                            controller: 'UserModalController',
                            scope: $scope,
                            resolve: {
                                items: function() {
                                    return {
                                        id: $stateParams.id
                                    }
                                }
                            }
                        });
                        $scope.modal.result.then(function (selectedItem) {
                            $timeout(function () {
                                updateAccountView()
                                SweetAlert.swal({
                                    title: "Good Job!",
                                    text: "Wallet has been updated!",
                                    type: "success",
                                    closeOnConfirm: true
                                }, function (ok) {
                                    if (ok) {

                                    }

                                });
                            });
                        }, function (err) {
                            if (err !== null) {
                                $scope.emsg = err.data.status + ' - ' + err.data.message;
                                SweetAlert.swal("Oops!", "Error : " + $scope.emsg, "error");
                            }
                        });
                    })
            }
            $scope.updateWalletList = function () {
                api.getWallets($scope.tdata.sourceAccount)
                    .then(function (wa) {
                        $scope.tdata.sourceWallets = wa.wallets;
                        return api.getWallets($scope.tdata.destAccount);
                    })
                    .then(function (wb) {
                        $scope.tdata.destWallets = wb.wallets;

                    })
            }
            $scope.getRates = function () {
                if (('undefined' !== typeof $scope.tdata.source) && ('undefined' !== typeof $scope.tdata.destination)) {
                    var found = false;
                    $scope.raz = {}
                    $scope.raz.source = $scope.tdata.source.split(':');
                    $scope.raz.destination = $scope.tdata.destination.split(':');
                    $scope.raz.myrate = 1;
                    if ($scope.raz.source[1] !== $scope.raz.destination[1]) {
                        $scope.raz.reverse = false;
                        var rara = $scope.tdata.rates.filter(function (e) {
                            return ( (e.source == $scope.raz.source[1]) && e.destination == $scope.raz.destination[1])
                        });
                        if (rara.length > 0) {
                            $scope.raz.myrate = rara[0].rate;
                        } else {
                            var rara = $scope.tdata.rates.filter(function (e) {
                                return ( (e.destination == $scope.raz.source[1]) && e.source == $scope.raz.destination[1])
                            });
                            $scope.raz.reverse = true;
                            $scope.raz.myrate = rara[0].rate;
                        }
                    }

                }

            }
            $scope.popup1 = {
                opened: false
            }
            $scope.open1 = function () {
                $scope.popup1.opened = true;
            };

            $scope.resetProfitMap = function () {
                if ($scope.account._id !== $scope.profile.main_account) {
                    var acc = $scope.account;
                    if (acc.type != 'wholesaler') {
                        api.getProfitMap(acc.parent)
                            .then(function (ret) {
                                ret.maps.forEach(function (m) {
                                    $scope.parentProfit[m.code] = m.profit_pct;
                                })
                                return api.getProfitMap($scope.account._id);
                            })
                            .then(function (p) {
                                $scope.ProfitMap = {}
                                $scope.ProfitMap.maps = [];
                                $scope.ProfitMap.active = p.active;
                                console.log("I am angel", p);
                                p.maps.forEach(function (m) {
                                    var o = {};
                                    o.code = m.code;
                                    o.active = m.active;
                                    var c = o.code.split(':');
                                    var parent_pct = 0;
                                    Object.keys($scope.parentProfit).forEach(function (key) {
                                        if (key == o.code)
                                            parent_pct = $scope.parentProfit[key];
                                    })
                                    o.profit_pct = m.profit_pct;
                                    o.profit_rate = 0;
                                    if (c[0] == 'ALL') {
                                        o.country = 'All Countries'
                                    } else {
                                        var currencyval = $scope.country_currency[c[0].toLowerCase()];
                                        var subflag = false;
                                        var rate = 0;
                                        for (var i = 0; i < $scope.subWallet.length; i++) {
                                            if ($scope.subWallet[i] == currencyval) {
                                                subflag = true;
                                                rate = 1;
                                            }
                                        }
                                        if (!subflag) {
                                            var cur_usd = $scope.currencyRate[$scope.mainWallet];
                                            rate = $scope.currencyRate[currencyval] / cur_usd;
                                        }
                                        o.profit_rate = (100 - o.profit_pct - parent_pct) * rate / 100;
                                        o.profit_rate += (' ' + currencyval);
                                        var co = JSON.parse($window.localStorage['clist']);
                                                co.forEach(function (z) {
                                                    if (z.iso == c[0].toLowerCase()) {
                                                        o.country = z.country;
                                                    }
                                                })
                                           

                                    }
                                    if (c[1] == 'ALL') {
                                        o.operator = 'All Operators'
                                    } else {
                                        api.getOperators(c[0].toLowerCase())
                                            .then(function (oz) {
                                                oz.forEach(function (xx) {
                                                    if (o.code == xx.code) {
                                                        o.operator = xx.operator_name;
                                                    }
                                                })
                                            })
                                    }
                                    $scope.ProfitMap.maps.push(o);
                                })
                            })
                    }
                    else {
                        api.getProfitMap(acc._id)
                            .then(function (p) {
                                $scope.ProfitMap = {}
                                $scope.ProfitMap.maps = [];
                                $scope.ProfitMap.active = p.active;
                                p.maps.forEach(function (m) {
                                    var o = {};
                                    o.code = m.code;
                                    o.active = m.active;
                                    var c = o.code.split(':');
                                    o.profit_pct = m.profit_pct;
                                    o.profit_rate = 0;
                                    if (c[0] == 'ALL') {
                                        o.country = 'All Countries'
                                    } else {
                                        var currencyval = $scope.country_currency[c[0].toLowerCase()];
                                        var subflag = false;
                                        var rate = 0;
                                        for (var i = 0; i < $scope.subWallet.length; i++) {
                                            if ($scope.subWallet[i] == currencyval) {
                                                subflag = true;
                                                rate = 1;
                                            }
                                        }
                                        if (!subflag) {
                                            var cur_usd = $scope.currencyRate[$scope.mainWallet];
                                            rate = $scope.currencyRate[currencyval] / cur_usd;
                                        }
                                        o.profit_rate = (100 - o.profit_pct) * rate / 100;
                                        o.profit_rate += (' ' + currencyval);
                                        var co = JSON.parse($window.localStorage['clist']);
                                                co.forEach(function (z) {
                                                    if (z.iso == c[0].toLowerCase()) {
                                                        o.country = z.country;
                                                    }
                                                })

                                    }
                                    if (c[1] == 'ALL') {
                                        o.operator = 'All Operators'
                                    } else {
                                        api.getOperators(c[0].toLowerCase())
                                            .then(function (oz) {
                                                oz.forEach(function (xx) {
                                                    if (o.code == xx.code) {
                                                        o.operator = xx.operator_name;
                                                    }
                                                })
                                            })
                                    }
                                    $scope.ProfitMap.maps.push(o);
                                })
                            })
                    }
                }
            }
            $scope.resetAcl = function () {                
                var acc = $scope.account;
                if ('undefined' !== typeof acc.acl) {
                    $scope.AccessList = {};
                    $scope.AccessList.type = 'permissive';
                    $scope.AccessList.block = [];
                    $scope.AccessList.allow = [];
                    $scope.AccessList.active = false;
                    $scope.createNewAcl = true;
                    api.getAcl(acc._id)
                        .then(function (a) {
                            $scope.AccessList = {};
                            $scope.AccessList.type = a.type;
                            $scope.AccessList.block = [];
                            $scope.AccessList.allow = [];
                            $scope.AccessList.active = a.active;
                            a.block.forEach(function (x) {
                                var o = {}
                                o.code = x.code;
                                o.active = x.active;
                                var c = x.code.split(':');
                                if (c[0] == 'ALL') {
                                    o.country = 'All Countries'
                                } else {
                                    var co = JSON.parse($window.localStorage['clist']);
                                                co.forEach(function (z) {
                                                    if (z.iso == c[0].toLowerCase()) {
                                                        o.country = z.country;
                                                    }
                                                })
                                }
                                if (c[1] == 'ALL') {
                                    o.operator = 'All Operators'
                                } else {
                                    api.getOperators(c[0].toLowerCase())
                                        .then(function (oz) {
                                            oz.forEach(function (xx) {
                                                if (o.code == xx.code) {
                                                    o.operator = xx.operator_name;
                                                }
                                            })
                                        })
                                }
                                $scope.AccessList.block.push(o);
                            })
                            a.allow.forEach(function (x) {
                                var o = {}
                                o.code = x.code;
                                o.active = x.active;
                                var c = x.code.split(':');
                                if (c[0] == 'ALL') {
                                    o.country = 'All Countries'
                                } else {
                                    var co = JSON.parse($window.localStorage['clist']);
                                                co.forEach(function (z) {
                                                    if (z.iso == c[0].toLowerCase()) {
                                                        o.country = z.country;
                                                    }
                                                })
                                }
                                if (c[1] == 'ALL') {
                                    o.operator = 'All Operators'
                                } else {
                                    api.getOperators(c[0].toLowerCase())
                                        .then(function (oz) {
                                            oz.forEach(function (xx) {
                                                if (o.code == xx.code) {
                                                    o.operator = xx.operator_name;
                                                }
                                            })
                                        })
                                }
                                $scope.AccessList.allow.push(o);
                            })

                        })
                } else {
                    $scope.AccessList = {};
                    $scope.AccessList.type = 'permissive';
                    $scope.AccessList.block = [];
                    $scope.AccessList.allow = [];
                    $scope.AccessList.active = false;
                    $scope.createNewAcl = true;
                }
            }

            $scope.resetAclClick = function() {
                $scope.createNewAcl = true;
                $scope.AccessList = {};
                $scope.AccessList.type = 'permissive';
                $scope.AccessList.block = [];
                $scope.AccessList.allow = [];
                $scope.AccessList.active = true;
            }

            $scope.editAclEntry = function (type, acl) {
                        var c = $rootScope.countries;
                        $scope.AclCountries = [];
                        var allcountry = {country: 'ALL Countries', iso: 'ALL'};
                        $scope.AclCountries.push(allcountry);
                        for (var i = 0; i < c.length; i++) {
                            $scope.AclCountries.push(c[i]);
                            if (c[i].country == acl.country) {
                                $scope.acl_country = c[i];
                            }
                        }
                        var country = $scope.acl_country.iso;
                        if (country == 'ALL') {
                            $scope.AclOperators = [];
                            var alloperators = {operator_id: 'ALL', operator_name: 'ALL Operators'};
                            $scope.AclOperators.push(alloperators);
                        } else {
                            api.getOperators(country)
                                .then(function (op) {
                                    $scope.AclOperators = [];

                                    for (var i = 0; i < op.length; i++) {
                                        $scope.AclOperators.push(op[i]);
                                        if (op[i].operator_name == acl.operator) {
                                            $scope.acl_operator = op[i];
                                        }
                                    }
                                    $scope.rec = {};
                                    $scope.rec.acltype = type;
                                    $scope.rec.country = "0";
                                    $scope.rec.operator = "0";
                                    $scope.editacl = acl;
                                    $scope.modal = $uibModal.open({
                                        animation: true,
                                        ariaLabelledBy: 'modal-title',
                                        ariaDescribedBy: 'modal-body',
                                        templateUrl: 'views/partials/modal-edit-aclentry.html',
                                        controller: 'UserModalController',
                                        scope: $scope,
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
                                });
                        }
            }
            $scope.updateAcl = function () {

                $scope.progressbar = ngProgressFactory.createInstance();
                $scope.progressbar.start();
                if ($scope.createNewAcl) {
                    api.createAcl($scope.account._id, $scope.AccessList)
                        .then(function (a) {
                            $scope.progressbar.complete();
                            SweetAlert.swal({
                                title: "Good Job!",
                                text: "Changes Saved!",
                                type: "success",
                                closeOnConfirm: true
                            }, function (ok) {
                                if (ok) {
                                    $scope.account.acl = {};
                                    $scope.account.acl = a;
                                    $scope.resetAcl();
                                }

                            });
                        }).catch(function (err) {
                        console.log(err);
                        $scope.progressbar.complete();
                        $scope.emsg = err.data.error.status + ' - ' + err.data.error.message;
                        SweetAlert.swal("Oops!", "Error : " + $scope.emsg, "error");
                    })

                } else {


                    api.updateAcl($scope.account._id, $scope.AccessList)
                        .then(function (a) {
                            $scope.progressbar.complete();
                            SweetAlert.swal({
                                title: "Good Job!",
                                text: "Changes Saved!",
                                type: "success",
                                closeOnConfirm: true
                            }, function (ok) {
                                if (ok) {
                                    $scope.resetAcl();
                                }

                            });
                        })
                        .catch(function (err) {
                            console.log(err);
                            $scope.progressbar.complete();
                            $scope.emsg = err.data.error.status + ' - ' + err.data.error.message;
                            SweetAlert.swal("Oops!", "Error : " + $scope.emsg, "error");
                        })
                }
            }

            $scope.updateProfitMap = function () {
                $scope.progressbar = ngProgressFactory.createInstance();
                $scope.progressbar.start();
                api.updateProfitMap($scope.account._id, $scope.ProfitMap)
                    .then(function (a) {
                        $scope.progressbar.complete();
                        SweetAlert.swal({
                            title: "Good Job!",
                            text: "Changes Saved!",
                            type: "success",
                            closeOnConfirm: true
                        }, function (ok) {
                            if (ok) {
                                $scope.resetProfitMap();
                            }

                        });
                    })
                    .catch(function (err) {
                        console.log(err);
                        $scope.progressbar.complete();
                        $scope.emsg = err.data.error.status + ' - ' + err.data.error.message;
                        SweetAlert.swal("Oops!", "Error : " + $scope.emsg, "error");
                    })
            }
            $scope.updateAccount = function () {
                $scope.progressbar = ngProgressFactory.createInstance();
                $scope.progressbar.start();
                api.updateAccount($stateParams.id, $scope.account)
                    .then(function (fa) {
                        updateAccountView();
                        $scope.progressbar.complete();
                        SweetAlert.swal({
                            title: "Good Job!",
                            text: "Changes Saved!",
                            type: "success",
                            closeOnConfirm: true
                        }, function (ok) {
                            if (ok) {
                            }

                        });
                    })
                    .catch(function (err) {
                        console.log(err);
                        $scope.progressbar.complete();
                        $scope.emsg = err.data.error.status + ' - ' + err.data.error.message;
                        SweetAlert.swal("Oops!", "Error : " + $scope.emsg, "error");
                    })
            }
            $scope.newuser = function () {
                $scope.modal = $uibModal.open({
                    animation: true,
                    ariaLabelledBy: 'modal-title',
                    ariaDescribedBy: 'modal-body',
                    templateUrl: 'views/partials/modal-new-user.html',
                    controller: 'UserModalController',
                    resolve: {
                        items: function() {
                            return {
                                id: $stateParams.id
                            }
                        }
                    }
                });
                $scope.modal.result.then(function (selectedItem) {
                    $timeout(function () {
                        updateUserView();
                    });
                }, function () {
                    console.log('but i waz dizmizeddd')
                });
            }

            $scope.deleteAccount = function (account) {
                $scope.recid = account._id;
                api.getAccountUsers($scope.recid)
                    .then(function (users) {
                        $scope.masteruser = users.users[0].username;
                    });
                if (account.type == 'wholesaler')
                    $scope.iswholesaler = true;
                else
                    $scope.iswholesaler = false;
                api.getChildAccounts(account._id)
                    .then(function (accounts) {
                        $scope.childrens = accounts.accounts;
                        if ($scope.childrens.length > 0)
                            $scope.childflag = true;
                        else
                            $scope.childflag = false;
                        $scope.modal = $uibModal.open({
                            animation: true,
                            ariaLabelledBy: 'modal-title',
                            ariaDescribedBy: 'modal-body',
                            templateUrl: 'views/partials/modal-delete-account.html',
                            controller: 'UserModalController',
                            scope: $scope,
                            resolve: {
                                items: function() {
                                    return {
                                        id: $stateParams.id
                                    }
                                }
                            }
                        });
                        $scope.modal.result.then(function (selectedItem) {
                            $timeout(function () {
                                updateChildView();
                            });
                        }, function () {
                            console.log('but i waz dizmizeddd')
                        });
                    });
            }

            $scope.updateOperList = function () {
                var country = $scope.rec.country;
                $scope.rate_symbol = 'USD';
                if (country == 'ALL') {
                    $scope.AclOperators = [];
                    $scope.canSelectOper = true;
                    //$scope.AclOperators.push({operator_id: 'ALL', operator_name: 'ALL Operators'});
                    $scope.acl_operator = $scope.AclOperators[0];
                } else {
                    $scope.rate_symbol = $scope.country_currency[country];
                    api.getOperators(country)
                        .then(function (op) {
                            $scope.AclOperators = op;
                            $scope.canSelectOper = true;
                        });
                }
            }
            $scope.deleteAclEntry = function (type, code) {
                if (type == 'block') {
                    var newlist = $scope.AccessList.block.filter(function (e) {
                        return e.code !== code
                    })
                    $scope.AccessList.block = newlist;
                } else if (type == 'allow') {
                    var newlist = $scope.AccessList.allow.filter(function (e) {
                        return e.code !== code
                    })
                    $scope.AccessList.allow = newlist;
                }
            }
            $scope.deleteProfitMapEntry = function (code) {
                var newlist = $scope.ProfitMap.maps.filter(function (e) {
                    return e.code !== code
                })
                $scope.ProfitMap.maps = newlist;
            }

            $scope.editProfitMapEntry = function (entry) {
                //$account_name
              
                //$account_name
                var c = JSON.parse($window.localStorage['clist']);

                        $scope.AclCountries = [];
                        var allcountry = {country: 'ALL Countries', iso: 'ALL'};
                        $scope.AclCountries.push(allcountry);
                        var country = '';
                        for (var i = 0; i < c.length; i++) {
                            $scope.AclCountries.push(c[i]);
                            if (c[i].country == entry.country) {
                                $scope.acl_country = c[i];
                                country = $scope.acl_country.iso;
                            }
                        }

                        if (country == '') {
                            $scope.acl_country = $scope.AclCountries[0];
                            $scope.AclOperators = [];
                            $scope.AclOperators.push({operator_id: 'ALL', operator_name: 'ALL Operators'});
                            $scope.acl_operator = $scope.AclOperators[0];
                        } else {
                            api.getOperators(country)
                                .then(function (op) {
                                    $scope.AclOperators = [];
                                    $scope.AclOperators.push({operator_id: 'ALL', operator_name: 'ALL Operators'});
                                    var flag = false;
                                    for (var i = 0; i < op.length; i++) {
                                        $scope.AclOperators.push(op[i]);
                                        if (op[i].operator_name == entry.operator) {
                                            flag = true;
                                            $scope.acl_operator = op[i];
                                        }
                                    }
                                    if (!flag) {
                                        $scope.acl_operator = $scope.AclOperators[0];
                                    }
                                });
                        }
                        $scope.rec = {};
                        $scope.rec.country = entry.code.split(':')[0];
                        $scope.rec.operator = entry.code.split(':')[1];
                        $scope.rec.profit_pct = entry.profit_pct;
                        $scope.oldPentry = entry;
                        if (entry.profit_rate != '') {
                            var val = entry.profit_rate.split(' ');
                            $scope.rec.profit_rate = val[0];
                            $scope.rate_symbol = val[1];
                            var subflag = false;
                            for (var i = 0; i < $scope.subWallet.length; i++) {
                                if ($scope.subWallet[i] == $scope.rate_symbol) {
                                    subflag = true;
                                    $scope.currentRate = 1;
                                }
                            }
                            if (!subflag) {
                                var cur_usd = $scope.currencyRate[$scope.mainWallet];
                                $scope.currentRate = $scope.currencyRate[$scope.rate_symbol] / cur_usd;
                            }
                        }
                        else {
                            $scope.rec.profit_rate = 0;
                            $scope.rate_symbol = '';
                        }
                        $scope.modal = $uibModal.open({
                            animation: true,
                            ariaLabelledBy: 'modal-title',
                            ariaDescribedBy: 'modal-body',
                            templateUrl: 'views/partials/modal-edit-profitentry.html',
                            controller: 'UserModalController',
                            scope: $scope,
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
                   // })


            }

            $scope.newentry = function (acltype) {
                var c = JSON.parse($window.localStorage['clist']);
                        $scope.AclCountries = c ;
                    
                $scope.canSelectOper = false;
                $scope.rec = {};
                $scope.rec.acltype = acltype;
                $scope.rec.country = "0";
                $scope.rec.operator = "0";
                $scope.modal = $uibModal.open({
                    animation: true,
                    ariaLabelledBy: 'modal-title',
                    ariaDescribedBy: 'modal-body',
                    templateUrl: 'views/partials/modal-new-aclentry.html',
                    controller: 'UserModalController',
                    scope: $scope,
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
            $scope.newPentry = function () {
                var c = JSON.parse($window.localStorage['clist']);
                        $scope.AclCountries = c;
                    
                $scope.canSelectOper = false;
                $scope.rec = {};
                $scope.rec.country = "0";
                $scope.rec.operator = "0";
                $scope.rec.profit_pct = 0;
                $scope.rec.profit_rate = 0;
                $scope.showMPP = false;
                $scope.modal = $uibModal.open({
                    animation: true,
                    ariaLabelledBy: 'modal-title',
                    ariaDescribedBy: 'modal-body',
                    templateUrl: 'views/partials/modal-new-profitentry.html',
                    controller: 'UserModalController',
                    scope: $scope,
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
            $scope.topup = function () {
                $scope.modal = $uibModal.open({
                    animation: true,
                    ariaLabelledBy: 'modal-title',
                    ariaDescribedBy: 'modal-body',
                    templateUrl: 'views/partials/modal-topup.html',
                    controller: 'UserModalController',
                    resolve: {
                        items: function() {
                            return {
                                id: $stateParams.id
                            }
                        }
                    }
                });
                $scope.modal.result.then(function (selectedItem) {
                    $timeout(function () {
                        updateAccountView();
                    });
                }, function () {
                    console.log('but i waz dizmizeddd')
                });
            }
            $scope.transferFunds = function () {
                $scope.tdata = {}
                $scope.tdata.accounts = [];
                $scope.tdata.sourceWallets = [];
                $scope.tdata.destWallets = [];
                $scope.tdata.rates = [];
                $scope.tdata.sourceAccount = $scope.account._id;
                $scope.tdata.destAccount = $scope.account._id;
                $scope.rec = {}
                $scope.rec.source = null;
                $scope.rec.destination = null;
                $scope.rec.amount = null;
                $scope.rec.sourcecur = null;
                $scope.rec.destcur = null;
                var r = JSON.parse($window.localStorage['rates']);
                        $scope.tdata.rates = r;
                      api.getWallets($scope.account._id)
                    .then(function (wa) {
                        $scope.tdata.sourceWallets = wa.wallets;
                        $scope.tdata.destWallets = wa.wallets;

                        return api.getAccounts()
                    })
                    .then(function (acc) {
                        if ($scope.profile.account_type !== 'agent') {
                            $scope.tdata.accounts = acc.accounts;
                        }

                        return api.getAccount($scope.profile.main_account)
                    })
                    .then(function (ma) {
                        $scope.tdata.accounts.push(ma)
                        $scope.modal = $uibModal.open({
                            animation: true,
                            ariaLabelledBy: 'modal-title',
                            ariaDescribedBy: 'modal-body',
                            templateUrl: 'views/partials/modal-new-transfer.html',
                            controller: 'UserModalController',
                            scope: $scope,
                            resolve: {
                                items: function() {
                                    return {
                                        id: $stateParams.id
                                    }
                                }
                            }
                        });
                        $scope.modal.result.then(function (selectedItem) {
                            $timeout(function () {
                                updateAccountView()
                                SweetAlert.swal({
                                    title: "Good Job!",
                                    text: "Funds Transfer Completed!",
                                    type: "success",
                                    closeOnConfirm: true
                                }, function (ok) {
                                    if (ok) {

                                    }

                                });
                            });
                        }, function (err) {
                            if ('undefined' !== typeof err) {
                                console.log('err', err);
                                $scope.emsg = err.data.status + ' - ' + err.data.message;
                                SweetAlert.swal("Oops!", "Error : " + $scope.emsg, "error");
                            }
                        });
                    })

            }
            $scope.transferFundsID = function (accid) {
                $scope.tdata = {};
                $scope.tdata.accounts = [];
                $scope.tdata.sourceWallets = [];
                $scope.tdata.destWallets = [];
                $scope.tdata.rates = [];
                $scope.tdata.sourceAccount = $scope.profile.main_account;
                $scope.tdata.destAccount = accid;
                $scope.rec = {};
                $scope.rec.source = null;
                $scope.rec.destination = null;
                $scope.rec.amount = null;
                $scope.rec.sourcecur = null;
                $scope.rec.destcur = null;
                var r = JSON.parse($window.localStorage['rates']);
                        $scope.tdata.rates = r;
                 api.getWallets($scope.profile.main_account)
                   
                    .then(function (wa) {
                        $scope.tdata.sourceWallets = wa.wallets;
                        return api.getWallets(accid);
                    })
                    .then(function (wb) {
                        $scope.tdata.destWallets = wb.wallets;
                        if ($scope.profile.account_type !== 'agent') {
                            return api.getAccounts()
                        } else {
                            return true;
                        }
    
                    })
                    .then(function (acc) {
                        if ($scope.profile.account_type !== 'agent') {
                            $scope.tdata.accounts = acc.accounts;
                        }
    
                        return api.getAccount($scope.profile.main_account)
                    })
                    .then(function (ma) {
                        $scope.tdata.accounts.push(ma)
                        $scope.modal = $uibModal.open({
                            animation: true,
                            ariaLabelledBy: 'modal-title',
                            ariaDescribedBy: 'modal-body',
                            templateUrl: 'views/partials/modal-new-transfer.html',
                            controller: 'UserModalController',
                            scope: $scope,
                            resolve: {
                                items: function() {
                                    return {
                                        id: $stateParams.id
                                    }
                                }
                            }
                        });
                        $scope.modal.result.then(function (selectedItem) {
                            $timeout(function () {
    
                                $rootScope.updateBalance()
                                SweetAlert.swal({
                                    title: "Good Job!",
                                    text: "Funds Transfer Completed!",
                                    type: "success",
                                    closeOnConfirm: true
                                }, function (ok) {
                                    if (ok) {
                                        updateAccountsView()
                                    }
    
                                });
                            });
                        }, function (err) {
                            if ('undefined' !== typeof err) {
                                console.log('err', err);
                                $scope.emsg = err.data.status + ' - ' + err.data.message;
                                SweetAlert.swal("Oops!", "Error : " + $scope.emsg, "error");
                            }
                        });
                    })
    
            }
            $scope.newfinrec = function () {
                $scope.modal = $uibModal.open({
                    animation: true,
                    ariaLabelledBy: 'modal-title',
                    ariaDescribedBy: 'modal-body',
                    templateUrl: 'views/partials/modal-new-finrec.html',
                    controller: 'UserModalController',
                    resolve: {
                        items: function() {
                            return {
                                id: $stateParams.id
                            }
                        }
                    }
                });
                $scope.modal.result.then(function (selectedItem) {
                    $timeout(function () {
                        updateAccountView();
                    });
                }, function () {
                    console.log('but i waz dizmizeddd')
                });
            }

            $scope.topup = function () {
                $scope.modal = $uibModal.open({
                    animation: true,
                    ariaLabelledBy: 'modal-title',
                    ariaDescribedBy: 'modal-body',
                    templateUrl: 'views/partials/modal-topup.html',
                    controller: 'UserModalController',
                    resolve: {
                        items: function() {
                            return {
                                id: $stateParams.id
                            }
                        }
                    }
                });
                $scope.modal.result.then(function (selectedItem) {
                    $timeout(function () {
                        updateAccountView();
                    });
                }, function () {
                    console.log('but i waz dizmizeddd')
                });
            }

            $scope.editUser = function (id) {
                api.getUser($stateParams.id, id)
                    .then(function (u) {
                        $scope.user = u;
                        $scope.modal = $uibModal.open({
                            animation: true,
                            ariaLabelledBy: 'modal-title',
                            ariaDescribedBy: 'modal-body',
                            templateUrl: 'views/partials/modal-edit-user.html',
                            controller: 'UserModalController',
                            scope: $scope,
                            resolve: {
                                items: function() {
                                    return {
                                        id: $stateParams.id
                                    }
                                }
                            }
                        });
                        $scope.modal.result.then(function (selectedItem) {
                            $timeout(function () {
                                updateUserView();
                            });
                        }, function () {
                            console.log('but i waz dizmizeddd')
                        });
                    })

            }
            $scope.editCred = function (id) {
                api.getCredentialAccount($stateParams.id, id)
                    .then(function (u) {
                        $scope.rec = u;
                        $scope.rec.srcNum = '';
                        u.sourceNumbers.forEach(function (a) {
                            $scope.rec.srcNum += a + ',';
                        })
                        $scope.rec.srcNum = $scope.rec.srcNum.substring(0, $scope.rec.srcNum.length - 1);
                        $scope.modal = $uibModal.open({
                            animation: true,
                            ariaLabelledBy: 'modal-title',
                            ariaDescribedBy: 'modal-body',
                            templateUrl: 'views/partials/modal-edit-credential.html',
                            controller: 'UserModalController',
                            scope: $scope,
                            resolve: {
                                items: function() {
                                    return {
                                        id: $stateParams.id
                                    }
                                }
                            }
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
            $scope.deleteCred = function (id) {

                $scope.recid = id;
                $scope.modal = $uibModal.open({
                    animation: true,
                    ariaLabelledBy: 'modal-title',
                    ariaDescribedBy: 'modal-body',
                    templateUrl: 'views/partials/modal-delete-credential.html',
                    controller: 'UserModalController',
                    scope: $scope,
                    resolve: {
                        items: function() {
                            return {
                                id: $stateParams.id
                            }
                        }
                    }
                });
                $scope.modal.result.then(function (selectedItem) {
                    $timeout(function () {
                        updateCredentialView();
                    });
                }, function () {
                    console.log('but i waz dizmizeddd')
                });


            }

            $scope.deleteUser = function (id) {
                api.getUser($stateParams.id, id)
                    .then(function (u) {
                        $scope.user = u;
                        console.log(u);
                        $scope.modal = $uibModal.open({
                            animation: true,
                            ariaLabelledBy: 'modal-title',
                            ariaDescribedBy: 'modal-body',
                            templateUrl: 'views/partials/modal-delete-user.html',
                            controller: 'UserModalController',
                            scope: $scope,
                            resolve: {
                                items: function() {
                                    return {
                                        id: $stateParams.id
                                    }
                                }
                            }
                        });
                        $scope.modal.result.then(function (selectedItem) {
                            $timeout(function () {
                                updateUserView();
                            });
                        }, function () {
                            console.log('but i waz dizmizeddd')
                        });
                    })

            }
            $scope.deleteFinRecord = function (id) {
                $scope.recid = id;
                $scope.modal = $uibModal.open({
                    animation: true,
                    ariaLabelledBy: 'modal-title',
                    ariaDescribedBy: 'modal-body',
                    templateUrl: 'views/partials/modal-delete-finrec.html',
                    controller: 'UserModalController',
                    scope: $scope,
                    resolve: {
                        items: function() {
                            return {
                                id: $stateParams.id
                            }
                        }
                    }
                });
                $scope.modal.result.then(function (selectedItem) {
                    $timeout(function () {
                        updateAccountView();
                    });
                }, function () {
                    console.log('but i waz dizmizeddd')
                });
            }

            $scope.editFinRecord = function (id) {
                $scope.recid = id;
                $scope.account.financial.forEach(function (f) {
                    if (f._id == id) {
                        $scope.rec = f;
                    }
                });
                $scope.modal = $uibModal.open({
                    animation: true,
                    ariaLabelledBy: 'modal-title',
                    ariaDescribedBy: 'modal-body',
                    templateUrl: 'views/partials/modal-edit-finrec.html',
                    controller: 'UserModalController',
                    scope: $scope,
                    resolve: {
                        items: function() {
                            return {
                                id: $stateParams.id
                            }
                        }
                    }
                });
                $scope.modal.result.then(function (selectedItem) {
                    $timeout(function () {
                        updateAccountView();
                    });
                }, function () {
                    console.log('but i waz dizmizeddd')
                });
            }

            $scope.uploadLogo = function (file, errFiles) {
                $scope.f = file;
                $scope.errFile = errFiles && errFiles[0];
                if (file) {
                    file.upload = Upload.upload({
                        url: '/api/accounts/' + $scope.account._id + '/logoupload?token=' + $scope.profile.token,
                        data: {userPhoto: file}
                    });

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

            $scope.uploadFavicon = function (file, errFiles) {
                $scope.faviconF = file;
                $scope.errFile = errFiles && errFiles[0];
                if (file) {
                    file.upload = Upload.upload({
                        url: '/api/accounts/' + $scope.account._id + '/faviconupload?token=' + $scope.profile.token,
                        data: {userPhoto: file}
                    });

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

            var updateInit = function () {
                updateProfileView();
                updateAccountView();
                updateChildView();
                updateUserView();
                updateTransactionView();
          //      updateTopuplogsView();
                updateCredentialView();
                updateDFRView();
                $scope.load();

            }
            updateInit();
        } else {
            $location.path('/login');
        }

    }]);


//UserModalController

angular.module('billinguiApp')
    .controller('UserModalController', ['$uibModalInstance', '$scope', 'api', 'items', 'Upload', function ($uibModalInstance, $scope, api, items, Upload) {

        /**DFR DFR */
        $scope.createDROK = function () {
            if ($scope.rec.active) {
  
            } else {
                $scope.rec.active = false;
            }
            api._post('/accounts/' + items.id + '/drules', $scope.rec)
                .then(function (re) {
                    $uibModalInstance.close();
                })
                .catch(function (err) {
                    $uibModalInstance.dismiss();
                })
        }
           $scope.drEditOK = function () {
              
            api._put('/accounts/' + items.id + '/drules/' + $scope.recid, $scope.rec)
                .then(function (re) {
                    $uibModalInstance.close();
                })
                .catch(function (err) {
                    $uibModalInstance.dismiss();
                })
        }
        $scope.drDeleteOK = function () {
            api._delete('/accounts/' + items.id + '/drules/' + $scope.recid)
                .then(function (f) {
                    $uibModalInstance.close();
                })
                .catch(function (err) {
                    $uibModalInstance.dismiss();
                })
        }
  
        $scope.createFROK = function () {
          if ($scope.rec.active) {
  
          } else {
              $scope.rec.active = false;
          }
          api._post('/accounts/' + items.id + '/frules', $scope.rec)
              .then(function (re) {
                  $uibModalInstance.close();
              })
              .catch(function (err) {
                  $uibModalInstance.dismiss();
              })
      }
         $scope.frEditOK = function () {
            
          api._put('/accounts/' + items.id + '/frules/' + $scope.recid, $scope.rec)
              .then(function (re) {
                  $uibModalInstance.close();
              })
              .catch(function (err) {
                  $uibModalInstance.dismiss();
              })
      }
      $scope.frDeleteOK = function () {
          api._delete('/accounts/' + items.id + '/frules/' + $scope.recid)
              .then(function (f) {
                  $uibModalInstance.close();
              })
              .catch(function (err) {
                  $uibModalInstance.dismiss();
              })
      }
  
      $scope.addRule = function () {
          if ($scope.nrule.active) {
              $scope.nrule.active = true;
          } else {
              $scope.nrule.active = false;
          }
          $scope.rec.rules.push($scope.nrule);
          $scope.nrule = {};
      }
      $scope.removeRule = function (rule) {
         
          $scope.nru = [];
          $scope.rec.rules.forEach(function (x) {
              if (x.tag == rule.tag) {
                 
              } else {
                  $scope.nru.push(x);
              }
          })
          $scope.rec.rules = $scope.nru;
      }
        /**DFR DFR */
        $scope.change_rate = function () {
            var x = $scope.rec;
            var code = x.country.toUpperCase() + ':' + x.operator.toUpperCase();
            var parent_pct = 0;
            Object.keys($scope.parentProfit).forEach(function (key) {
                if (key == code)
                    parent_pct = $scope.parentProfit[key];
            })
            $scope.rec.profit_pct = 100 - ((100 * $scope.rec.profit_rate) / $scope.currentRate ) - parent_pct;
        }
        $scope.change_pct = function () {
            var x = $scope.rec;
            var code = x.country.toUpperCase() + ':' + x.operator.toUpperCase();
            var parent_pct = 0;
            Object.keys($scope.parentProfit).forEach(function (key) {
                if (key == code)
                    parent_pct = $scope.parentProfit[key];
            })
            $scope.rec.profit_rate = (100 - $scope.rec.profit_pct - parent_pct) * $scope.currentRate / 100;
        }

        $scope.accountsCancel = function () {
            console.log('Cancel Was clicked');
            $uibModalInstance.dismiss();
        }
        $scope.deleteOK = function () {
            $scope.masteruser = '';
            for (var i = 0; i < $scope.childrens.length; i++) {
                if ($scope.iswholesaler) {
                    api.getChildAccounts($scope.childrens[i]._id)
                        .then(function (accounts) {
                            var child_children = accounts.accounts;
                            for (var j = 0; j < child_children.length; j++) {
                                api.deleteAccount(child_children[j]._id)
                                    .then(function (d) {
                                    })
                                    .catch(function (err) {
                                    })
                            }
                        })
                    api.deleteAccount($scope.childrens[i]._id)
                        .then(function (d) {
                        })
                        .catch(function (err) {
                        })
                }
            }
            api.deleteAccount($scope.recid)
                .then(function (d) {
                    $uibModalInstance.close();
                })
                .catch(function (err) {
                    $uibModalInstance.dismiss(err);
                })
        }
        $scope.updateeditableOperList = function () {
            var country = $scope.acl_country.iso;
            if (country == 'ALL') {
                $scope.AclOperators = [];
                $scope.canSelectOper = true;
                var alloperators = {operator_id: 'ALL', operator_name: 'ALL Operators'};
                $scope.AclOperators.push(alloperators);
            } else {
                api.getOperators(country)
                    .then(function (op) {
                        $scope.AclOperators = [];
                        var alloperators = {operator_id: 'ALL', operator_name: 'ALL Operators'};
                        $scope.AclOperators.push(alloperators);
                        for (var i = 0; i < op.length; i++) {
                            $scope.AclOperators.push(op[i]);
                        }
                        $scope.canSelectOper = true;
                    });
            }
        }
        $scope.showPP = function () {
            $scope.rec.profit_pct = 0;
            var subflag = false;
            for (var i = 0; i < $scope.subWallet.length; i++) {
                if ($scope.subWallet[i] == $scope.rate_symbol) {
                    subflag = true;
                    $scope.currentRate = 1;
                }
            }
            if (!subflag) {
                var cur_usd = $scope.currencyRate[$scope.mainWallet];
                $scope.currentRate = $scope.currencyRate[$scope.rate_symbol] / cur_usd;
            }
            $scope.rec.profit_rate = (100 - $scope.rec.profit_pct) * $scope.currentRate / 100;
            $scope.showMPP = true;
        }
        $scope.editOperator = function () {
            $scope.rec.country = $scope.acl_country.iso;
            $scope.rec.operator = $scope.acl_operator.operator_id;
        }
        $scope.editProfit = function () {
            var country = $scope.acl_country.iso;
            $scope.rec.profit_pct = '';
            $scope.currentRate = '';
            $scope.rec.profit_rate = '';
            if (country == 'ALL') {
                $scope.AclOperators = [];
                //$scope.AclOperators.push({operator_id: 'ALL', operator_name: 'ALL Operators'});
                $scope.rate_symbol = '';
            } else {
                var currencyval = $scope.country_currency[country];
                $scope.rate_symbol = currencyval;
                var subflag = false;
                for (var i = 0; i < $scope.subWallet.length; i++) {
                    if ($scope.subWallet[i] == $scope.rate_symbol) {
                        subflag = true;
                        $scope.currentRate = 1;
                    }
                }
                if (!subflag) {
                    var cur_usd = $scope.currencyRate[$scope.mainWallet];
                    $scope.currentRate = $scope.currencyRate[$scope.rate_symbol] / cur_usd;
                }
                api.getOperators(country)
                    .then(function (op) {
                        $scope.AclOperators = [];
                        var alloperators = {operator_id: 'ALL', operator_name: 'ALL Operators'};
                        $scope.AclOperators.push(alloperators);
                        $scope.acl_operator = $scope.AclOperators[0];
                        for (var i = 0; i < op.length; i++) {
                            $scope.AclOperators.push(op[i]);
                        }
                    });
            }
        }
        api.getProfile()
            .then(function (prof) {
                $scope.profile = prof;

                if (prof.account_type == 'wholesaler') {
                    $scope.distr = true;
                } else {
                    $scope.distr = false;
                }
            });
        api.getAccount(items.id)
            .then(function (acc) {
                $scope.account = acc;
                if (acc.type == 'agent') {
                    $scope.dontshowchild = true;
                } else {
                    $scope.dontshowchild = false;
                }
            });
        $scope.editCredentialOK = function () {
            api.updateCredentialAccount(items.id, $scope.rec._id, $scope.rec)
                .then(function (bc) {
                    $uibModalInstance.close();
                })
                .catch(function (err) {
                    $uibModalInstance.dismiss(err);
                })
        }
        $scope.editAclEntryOK = function () {
            $scope.rec.country = $scope.acl_country.iso;
            $scope.rec.operator = $scope.acl_operator.operator_id;
            var x = $scope.rec;
            var o = {}
            var code = x.country.toUpperCase() + ':' + x.operator.toUpperCase();
            o.code = code;
            if (x.country !== 'ALL') {
                var cou = $scope.AclCountries.filter(function (co) {
                    return co.iso == x.country.toLowerCase()
                })
                o.country = cou[0].country;
            } else {
                o.country = 'All Countries'
            }
            if (x.operator !== 'ALL') {
                var oou = $scope.AclOperators.filter(function (oo) {
                    return oo.operator_id == x.operator
                })
                o.operator = oou[0].operator_name;
            } else {
                o.operator = 'All Operators'
            }

            o.active = true;
            if ($scope.rec.acltype == 'block') {
                for (var i = 0; i < $scope.AccessList.block.length; i++) {
                    if ($scope.AccessList.block[i].code == $scope.editacl.code) {
                        $scope.AccessList.block[i] = o;
                        break;
                    }
                }
            } else if ($scope.rec.acltype == 'allow') {
                for (var i = 0; i < $scope.AccessList.allow.length; i++) {
                    if ($scope.AccessList.allow[i].code == $scope.editacl.code) {
                        $scope.AccessList.allow[i] = o;
                        break;
                    }
                }
            }
            $uibModalInstance.close();
        }
        $scope.newAclEntryOK = function () {
            var x = $scope.rec;
            var o = {}
            var code = x.country.toUpperCase() + ':' + x.operator.toUpperCase();
            o.code = code;
            if (x.country !== 'ALL') {
                var cou = $scope.AclCountries.filter(function (co) {
                    return co.iso == x.country.toLowerCase()
                })
                o.country = cou[0].country;
            } else {
                o.country = 'All Countries'
            }
            if (x.operator !== 'ALL') {
                var oou = $scope.AclOperators.filter(function (oo) {
                    return oo.operator_id == x.operator
                })
                o.operator = oou[0].operator_name;
            } else {
                o.operator = 'All Operators'
            }

            o.active = true;
            if (x.acltype == 'allow') {
                $scope.AccessList.allow.push(o)
            } else if (x.acltype == 'block') {
                $scope.AccessList.block.push(o);
            }
            console.log(x, o);
            $uibModalInstance.close();
        }
        $scope.newWalletOK = function () {
            api.createWallet($scope.account._id, $scope.rec)
                .then(function (w) {
                    $uibModalInstance.close();
                })
                .catch(function (err) {
                    $uibModalInstance.dismiss(err);
                })
        }
        $scope.newCredentialOK = function () {
            api.createCredentialAccount($scope.account._id, $scope.rec)
                .then(function (x) {
                    $uibModalInstance.close();
                })
                .catch(function (e) {
                    $uibModalInstance.dismiss(e);
                })
        }
        $scope.editWalletOK = function () {
            api.updateWallet($scope.account._id, $scope.rec._id, $scope.rec)
                .then(function (w) {
                    $uibModalInstance.close();
                })
                .catch(function (err) {
                    $uibModalInstance.dismiss(err);
                })
        }
        $scope.newPentryOK = function () {
            var x = $scope.rec;
            var o = {}
            var code = x.country.toUpperCase() + ':' + x.operator.toUpperCase();
            o.code = code;
            if (x.country !== 'ALL') {
                var cou = $scope.AclCountries.filter(function (co) {
                    return co.iso == x.country.toLowerCase()
                })
                o.country = cou[0].country;
            } else {
                o.country = 'All Countries'
            }
            if (x.operator !== 'ALL') {
                var oou = $scope.AclOperators.filter(function (oo) {
                    return oo.operator_id == x.operator
                })
                o.operator = oou[0].operator_name;
            } else {
                o.operator = 'All Operators'
            }
            o.profit_pct = x.profit_pct;
            o.profit_rate = x.profit_rate + ' ' + $scope.rate_symbol;
            o.active = true;
            $scope.ProfitMap.maps.push(o);
            console.log(x, o);
            $uibModalInstance.close();
        }
        $scope.editPentryOK = function () {
            $scope.rec.country = $scope.acl_country.iso;
            $scope.rec.operator = $scope.acl_operator.operator_id;
            var x = $scope.rec;
            var o = {}
            var code = x.country.toUpperCase() + ':' + x.operator.toUpperCase();
            o.code = code;
            if (x.country !== 'ALL') {
                var cou = $scope.AclCountries.filter(function (co) {
                    return co.iso == x.country.toLowerCase()
                })
                o.country = cou[0].country;
            } else {
                o.country = 'All Countries'
            }
            if (x.operator !== 'ALL') {
                var oou = $scope.AclOperators.filter(function (oo) {
                    return oo.operator_id == x.operator
                })
                o.operator = oou[0].operator_name;
            } else {
                o.operator = 'All Operators'
            }
            o.profit_pct = x.profit_pct;
            o.profit_rate = x.profit_rate + ' ' + $scope.rate_symbol;
            o.active = true;
            for (var i = 0; i < $scope.ProfitMap.maps.length; i++) {
                if ($scope.ProfitMap.maps[i].code == $scope.oldPentry.code) {
                    $scope.ProfitMap.maps[i] = o;
                    break;
                }
            }
            console.log(x, o);
            $uibModalInstance.close();
        }
        $scope.transferFundsOK = function () {
            var obj = {
                destination: $scope.tdata.destination.split(':')[0],
                amount: $scope.rec.amount,
                description: $scope.rec.description
            };
            api.topupAcc($scope.tdata.destAccount, obj)
                .then(function (tx) {
                    $uibModalInstance.close();
                })
                .catch(function (err) {
                    $uibModalInstance.dismiss(err);
                })
        };
        $scope.uploadAvatar = function (file, errFiles) {
            $scope.f = file;
            $scope.errFile = errFiles && errFiles[0];
            if (file) {
                file.upload = Upload.upload({
                    url: '/api/accounts/' + $scope.account._id + '/users/' + $scope.user._id + '/avatar?token=' + $scope.profile.token,
                    data: {userPhoto: file}
                });

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
        $scope.newUserOK = function () {
            if ($scope.user.password == $scope.user.passwordconfirm) {
                delete $scope.user.passwordconfirm;
                api.createUser(items.id, $scope.user)
                    .then(function (u) {
                        console.log(u);
                    })
                $uibModalInstance.close();
            }

        }
        $scope.newUserCancel = function () {
            console.log('Cancel Was clicked');
            $uibModalInstance.dismiss();
        }
        $scope.editUserOK = function () {
            var nobj = {};
            for (key in $scope.user) {
                if ((key == 'main_account') || (key == '__v') || (key == '_id') || (key == 'createdAt') || (key == 'last_login') || (key == 'updatedAt') || (key == 'password') || (key == 'passwordconfirm'))
                    continue;
                nobj[key] = $scope.user[key];
            }
            if ($scope.user.password) {
                if ($scope.user.password == $scope.user.passwordconfirm) {
                    //ok
                    nobj.password = $scope.user.password;
                }
            }
            //update....
            api.editUser(items.id, $scope.user._id, nobj)
                .then(function (u) {


                })
                .catch(function (err) {
                    console.log(err);
                })
            $uibModalInstance.close();
        }
        $scope.deleteUserOK = function () {
            if ($scope.uconfirm == $scope.user.username) {
                api.deleteUser(items.id, $scope.user._id)
                    .then(function (uu) {
                    })
                    .catch(function (err) {
                        console.log(err);
                    })
                $uibModalInstance.close();
            } else {
                console.log('not match')
            }
        }
        $scope.deleteCredOK = function () {

            api.deleteCredentialAccount(items.id, $scope.recid)
                .then(function (uu) {

                })
                .catch(function (err) {
                    console.log(err);
                })
            $uibModalInstance.close();
        }
        $scope.newFinRecOK = function () {
            if ($scope.rec.primary) {

            } else {
                $scope.rec.primary = false;
            }
            var upd = {};
            upd.financial = [];
            $scope.account.financial.forEach(function (f) {
                upd.financial.push(f);
            })
            console.log('REC:', $scope.rec);
            upd.financial.push($scope.rec);
            api.updateAccount(items.id, upd)
                .then(function (up) {
                    $uibModalInstance.close();
                })
        }
        $scope.topupOK = function () {
            console.log('i am being called')
            var upd = {};
            upd.amount = $scope.top.amt;
            upd.reason = $scope.top.reason;
            api.topupAcc(items.id, upd)
                .then(function (up) {
                    $uibModalInstance.close();
                })
                .catch(function (err) {
                    console.log('big badaaaa boom')
                })
        }
        $scope.deleteFinRecordOK = function () {
            var nob = {};
            nob.financial = [];
            $scope.account.financial.forEach(function (f) {
                if (f._id == $scope.recid) {

                } else {
                    nob.financial.push(f);
                }
            });
            api.updateAccount(items.id, nob)
                .then(function (n) {
                    $uibModalInstance.close();
                })
        }
        $scope.editFinRecordOK = function () {
            var nob = {};
            nob.financial = [];
            $scope.account.financial.forEach(function (f) {
                if (f._id == $scope.recid) {

                } else {
                    nob.financial.push(f);
                }
            });
            nob.financial.push($scope.rec);
            api.updateAccount(items.id, nob)
                .then(function (u) {
                    $uibModalInstance.close();
                })
        }
        $scope.editSubOK = function () {
            console.log(' ok was clicked editSubOK ', $scope.sub)
            api.editSubscription(items.id, $scope.recid, $scope.sub)
                .then(function (f) {
                    $uibModalInstance.close();
                })
                .catch(function (err) {
                    $uibModalInstance.dismiss(err);
                })
        }
        $scope.createSubOK = function () {
            if ($scope.sub.subscription_type == 'package') {
                $scope.sub.quantity = 1;
            }
            api.createSubscription(items.id, $scope.sub)
                .then(function (s) {
                    $uibModalInstance.close();
                })
                .catch(function (err) {
                    $uibModalInstance.dismiss(err);
                })
        }
        $scope.deleteSubOK = function () {
            api.deleteSubscription(items.id, $scope.recid)
                .then(function (f) {
                    $uibModalInstance.close();
                })
                .catch(function (err) {
                    $uibModalInstance.dismiss(err);
                })
        }
        $scope.editRouteOK = function () {
            var bind = $scope.route;
            delete bind.rates;

            api.editRoute(items.id, $scope.recid, bind)
                .then(function (f) {
                    $uibModalInstance.close();
                })
                .catch(function (err) {
                    $uibModalInstance.dismiss(err);
                })
        }
        $scope.createRouteOK = function () {
            api.createRoute(items.id, $scope.route)
                .then(function (f) {
                    $uibModalInstance.close();
                })
                .catch(function (err) {
                    $uibModalInstance.dismiss(err);
                })
        }
        $scope.deleteRouteOK = function () {
            api.deleteRoute(items.id, $scope.recid)
                .then(function (f) {
                    $uibModalInstance.close();
                })
                .catch(function (err) {
                    $uibModalInstance.dismiss(err);
                })
        }
        $scope.newAssignmentOK = function () {
            if ($scope.account.available_routes.contains($scope.route.parent_route)) {
                $uibModalInstance.dismiss();
            } else {
                $scope.account.available_routes.push($scope.route.parent_route);
                var upd = {};
                upd.available_routes = [];
                upd.available_routes = $scope.account.available_routes;
                api.updateAccount(items.id, upd)
                    .then(function (f) {
                        $uibModalInstance.close();
                    })
                    .catch(function (err) {
                        $uibModalInstance.dismiss(err);
                    })
            }

        }
        $scope.deleteAssignmentOK = function () {

            var upd = {};
            upd.available_routes = [];
            $scope.account.available_routes.forEach(function (f) {
                if (f == $scope.recid) {

                } else {
                    upd.available_routes.push(f);
                }
            });
            api.updateAccount(items.id, upd)
                .then(function (f) {
                    $uibModalInstance.close();
                })
                .catch(function (err) {
                    $uibModalInstance.dismiss(err);
                })
        }
        $scope.cancel = function () {
            console.log('Cancel Was clicked');
            $uibModalInstance.dismiss();
        }
        $scope.newCCOK = function () {
            console.log($scope.account.permitted_apis, $scope.baa.apid)
            $scope.account.permitted_apis.push($scope.baa.apid);
            $uibModalInstance.close();
        }
        $scope.newIPOK = function () {
            $scope.account.appfw_whitelist.push($scope.baa.ip);
            $uibModalInstance.close();
        }
    }]);
