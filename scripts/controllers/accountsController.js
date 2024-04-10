//'use strict';

/**
 * @ngdoc function
 * @name billinguiApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the billinguiApp
 */
angular.module('billinguiApp')
    .controller('AccountsController', ['$scope', 'api', '$location', '$uibModal', '$timeout', '$stateParams', 'SweetAlert', 'ngProgressFactory','$interval', '$rootScope', '$window', function ($scope, api, $location, $uibModal, $timeout, $stateParams, SweetAlert, ngProgressFactory,$interval,$rootScope,$window) {

        if (api.isAuthed()) {
            $scope.userview = false ;
            $scope.page = 1;
            $scope.query = '';
            $scope.progressbar = ngProgressFactory.createInstance();
           // $scope.account_names = $rootScope.account_names();
           $scope.account_names = [];
            $scope.anames = JSON.parse($window.localStorage['acnames']);
            $scope.anames.forEach(function (line) {
                $scope.account_names[line._id] = line.account_name;
            })
            console.log($scope.progressbar);
            $scope.progressbar.start();

            api.updateProfile()
                .then(function (prof) {
                    $scope.profile = prof;
                })
                .catch(function (err) {
                    console.log(err);
                })
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


            }

                //for timer balance
                var timer_flag = true;
                var startTimer = function() {
                    $scope.timer = $interval(function(){
                        console.log("aaaaaaa");
                        if (timer_flag) {
                            timer_flag = false;
                            if ($scope.query == '') {
                                api._get('/accounts/page/' + $scope.page + '?fields=createdAt,parent,account_name,wholesaler,type,test_mode,legal_type,active,wallets')
                                .then(function (acc) {
                                    timer_flag  =true;
                                    $scope.accounts = acc.docs;
                                    $scope.count = acc.count;
                                    $scope.pages = acc.pages;
                                    $scope.page = acc.page;
                                    $scope.limit = acc.limit;
                                }).catch(function (err) { console.log(err); });
                            } else {
                                api._post('/accounts/page/' + $scope.page + '?fields=createdAt,parent,account_name,wholesaler,type,test_mode,legal_type,active,wallets', { query: $scope.query })
                                .then(function (acc) {
                                    timer_flag = true;
                                    $scope.accounts = acc.docs;
                                    $scope.count = acc.count;
                                    $scope.pages = acc.pages;
                                    $scope.page = acc.page;
                                    $scope.limit = acc.limit;
                                }).catch(function (err) { console.log(err); });
    
                            }
                           
                        }
                    }, 10000);
                }
                $scope.changePage = function (page) {
                    $scope.page = page;
                    if ($scope.query == '') {
                        updateAccountsView();
                    } else {
                        api._post('/accounts/page/' + $scope.page + '?fields=createdAt,parent,account_name,wholesaler,type,test_mode,legal_type,active,wallets', { query: $scope.query })
                            .then(function (acc) {
                                $scope.accounts = acc.docs;
                                $scope.count = acc.count;
                                $scope.pages = acc.pages;
                                $scope.page = acc.page;
                                $scope.limit = acc.limit;
                            }).catch(function (err) { console.log(err); });
                    }
                }
                var updateAccountsView = function () {
                    api._get('/accounts/page/' + $scope.page + '?fields=createdAt,parent,account_name,wholesaler,type,test_mode,legal_type,active,wallets')
                    //api.getAccounts()
                        .then(function (acc) {
                           // $scope.accounts = acc.accounts;
                           $scope.accounts = acc.docs;
                           $scope.count = acc.count;
                           $scope.pages = acc.pages;
                           $scope.page = acc.page;
                           $scope.limit = acc.limit;
                           if ($stateParams.filter !== '') {
                               $scope.typefilter = $stateParams.filter;
                           }
                           $scope.accountcount = acc.count;
                            var user_array = [];
                            for (var i = 0; i < acc.docs.length; i++) {
                                if(acc.docs[i].type == 'wholesaler') {
                                    var element = {
                                        _id: acc.docs[i]._id,
                                        child: [],
                                        type: 'wholesaler'
                                    };
                                    user_array.push(element);
                                }
                            }
                            var flag = user_array.length < 1;
                            for (i = 0; i < acc.docs.length; i++) {
                                if(acc.docs[i].type == 'reseller') {
                                    if (flag) {
                                        var element = {
                                            _id: acc.docs[i]._id,
                                            child: [],
                                            type: 'reseller'
                                        };
                                        user_array.push(element);
                                    } else {
                                        var _inserted = false;
                                        for (var _i = 0; _i < user_array.length; _i++) {
                                            if (user_array[_i]._id == acc.docs[i].parent) {
                                                var reseller_element = {
                                                    _id: acc.docs[i]._id,
                                                    child: []
                                                };
                                                user_array[_i].child.push(reseller_element);
                                                _inserted = true;
                                            }
                                        }
                                        if (!_inserted) {
                                            user_array.push({
                                                _id: acc.docs[i]._id,
                                                child: [],                              
                                                type: 'reseller'
                                            });
                                        }
                                    }
                                }
                            }
    
                            flag = user_array.length < 1;
    
                            for(i = 0; i < acc.docs.length; i++) {
                                if (flag) {
                                    user_array.push(acc.docs[i]);
                                } else {
                                    if(acc.docs[i].type == 'agent') {
                                        if (user_array[0].type == "reseller") {
                                            var inserted = false;
                                            for (_i = 0; _i < user_array.length; _i++) {
                                                if (acc.docs[i].parent == user_array[_i]._id) {
                                                    var agent_element = {
                                                        _id: acc.docs[i]._id,
                                                        type: 'agent',
                                                        child: []
                                                    };
                                                    user_array[_i].child.push(agent_element);
                                                    inserted = true;
                                                }
                                            }
                                            if (!inserted) {
                                                user_array.push({
                                                    _id: acc.docs[i]._id,
                                                    type: 'agent',
                                                    child: []
                                                });
                                            }
                                        } else {
                                            var _inserted = false;
                                            for(_i = 0; _i < user_array.length; _i++) {
                                                if (acc.docs[i].parent == user_array[_i]._id) {
                                                    var agent_element = {
                                                        _id: acc.docs[i]._id
                                                    };
                                                    user_array[_i].child.push(agent_element);
                                                    _inserted = true;
                                                } else {
                                                    var inserted = false;
                                                    for(var j = 0; j < user_array[_i].child.length; j++) {
                                                        if (acc.docs[i].parent == user_array[_i].child[j]._id) {
                                                            var agent_element = {
                                                                _id: acc.docs[i]._id
                                                            };
                                                            user_array[_i].child[j].child.push(agent_element);
                                                            inserted = true;
                                                            _inserted = true;
                                                        }
                                                    }
                                                    if (!inserted) {
                                                        user_array[_i].child.push({
                                                            _id: acc.docs[i]._id
                                                        });
                                                        _inserted = true;
                                                    }
                                                }
                                            }
                                            if (!_inserted) {
                                                user_array.push({
                                                    _id: acc.docs[i]._id
                                                })
                                            }
                                        }
                                    }
                                }
                            }
                            
    
                            $scope.data = user_array;
                            $scope.$broadcast('angular-ui-tree:collapse-all');
    
                           
                            //$scope.account_names = $rootScope.account_names;
                           // $scope.account_names[$scope.profile.main_account] = "Me";
                            /*
                             acc.accounts.forEach(function (f) {
                             if (f._id == $scope.profile.main_account) {
    
                             } else {
                             $scope.accounts.push(f);
                             }
                             })
                             */
                           // if ($stateParams.filter !== '') {
                             //   $scope.typefilter = $stateParams.filter;
                            //}
                           // $scope.accountcount = acc.count;
    
                        })
                        .catch(function (err) {
                            console.log(err);
                        });
                };
                $scope.doSearch = function (keyEvent) {
                    if ($scope.query.charAt(0) !== '/') {
                        if ($scope.query.length !== 0) {
    
                            if (keyEvent.which === 13) {
                                api._post('/accounts/page/1?fields=createdAt,parent,account_name,wholesaler,type,test_mode,legal_type,active,wallets', { query: $scope.query })
                                    .then(function (acc) {
                                        $scope.accounts = acc.docs;
                                        $scope.count = acc.count;
                                        $scope.pages = acc.pages;
                                        $scope.page = acc.page;
                                        $scope.limit = acc.limit;
                                    }).catch(function (err) { console.log(err); });
                            }
                        } else {
                            $scope.changePage(1)
                        }
                    } else {
                        if ($scope.query.length > 3) {
                            //send our query
                            api._post('/accounts/page/1?fields=createdAt,parent,account_name,wholesaler,type,test_mode,legal_type,active,wallets', { query: $scope.query })
                                .then(function (x) {
                                    $scope.accounts = x.accounts;
                                    $scope.count = x.count;
                                    $scope.pages = 1;
                                    $scope.page = 1;
                                    $scope.limit = x.count
                                }).catch(function (err) { console.log(err); });
                        }
                    }
                }

/*
            var updateAccountsView = function () {
                api.getAccounts()
                    .then(function (acc) {
                        $scope.accounts = acc.accounts;

                        var user_array = [];
                        for (var i = 0; i < acc.accounts.length; i++) {
                            if(acc.accounts[i].type == 'wholesaler') {
                                var element = {
                                    _id: acc.accounts[i]._id,
                                    child: []
                                };
                                user_array.push(element);
                            }
                        }
                        for (i = 0; i < acc.accounts.length; i++) {
                            if(acc.accounts[i].type == 'reseller') {
                                for (var _i = 0; _i < user_array.length; _i++) {
                                    if (user_array[_i]._id == acc.accounts[i].parent) {
                                        var reseller_element = {
                                            _id: acc.accounts[i]._id,
                                            child: []
                                        };
                                        user_array[_i].child.push(reseller_element);
                                    }
                                }
                            }
                        }

                        for(i = 0; i < acc.accounts.length; i++) {
                            if(acc.accounts[i].type == 'agent') {
                                for(_i = 0; _i < user_array.length; _i++) {
                                    if (acc.accounts[i].parent == user_array[_i]._id) {
                                        var agent_element = {
                                            _id: acc.accounts[i]._id
                                        };
                                        user_array[_i].child.push(agent_element);
                                    } else {
                                        for(var j = 0; j < user_array[_i].child.length; j++) {
                                            if (acc.accounts[i].parent == user_array[_i].child[j]._id) {
                                                var agent_element = {
                                                    _id: acc.accounts[i]._id
                                                };
                                                user_array[_i].child[j].child.push(agent_element);
                                            }
                                        }
                                    }
                                }
                            }
                        }

                        $scope.data = user_array;
                        $scope.$broadcast('angular-ui-tree:collapse-all');
                        $scope.progressbar.complete();
                        if ($stateParams.filter !== '') {
                            $scope.typefilter = $stateParams.filter;
                        }

                        var oo = [];
                        acc.accounts.map(function (f, i) {
                            oo[f._id] = f.account_name;
                        });
                        $scope.account_names = oo;
                        $scope.accountcount = acc.count;

                    }).catch(function (err) {
                    console.log(err);
                });
            };
*/
            var updateUsersView = function () {
                api.getUsers()
                .then(function (us) {
                    $scope.users = us.users;
                    $scope.progressbar.complete();
                })
                .catch(function (err) { console.log(err); });
            }

            $scope.showHierarchy = true;

            $scope.toggleHierarchy = function() {
                $scope.showHierarchy = !$scope.showHierarchy;
            };
            $scope.getAccountList = function () {
                $scope.rcsv = [];
                $scope.accounts.forEach(function (line) {
                    var rec = {};
                    rec.account_number = line.numeric_id;
                    rec.account_name = line.account_name;
                    rec.legal_type = line.legal_type;
                    rec.parent = line.parent_name;
                    rec.type = line.type;
                    $scope.rcsv.push(rec);
                });
                return $scope.rcsv;
            }
            $scope.transferFunds = function (accid) {
                $scope.tdata = {}
                $scope.tdata.accounts = [];
                $scope.tdata.sourceWallets = [];
                $scope.tdata.destWallets = [];
                $scope.tdata.rates = [];
                $scope.tdata.destAccount = accid
                $scope.rec = {}
                $scope.rec.source = null;
                $scope.rec.destination = null;
                $scope.rec.amount = null;
                $scope.rec.sourcecur = null;
                $scope.rec.destcur = null;
                $scope.tdata.rates = JSON.parse($window.localStorage['rates']);
               
                api.getWallets(accid)
                    .then(function (wa) {
                        $scope.tdata.sourceWallets = wa.wallets;
                        $scope.tdata.destWallets = wa.wallets;

                        //return api.getAccounts()
                        return JSON.parse($window.localStorage['acnames']);
                    })
                    .then(function (acc) {
                        if ($scope.profile.account_type !== 'agent') {
                            $scope.tdata.accounts = acc;
                        }
                        return
                    })
                    .then(function (ma) {
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
                                        id: accid
                                    }
                                }
                            }
                        });
                        $scope.modal.result.then(function (selectedItem) {
                            $timeout(function () {
                                updateAccountsView()
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

            };


            $scope.toggle = function (scope) {
                console.log("------", scope, "-----------");
                scope.toggle();
            };

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
                            controller: 'AccountsModalController',
                            scope: $scope
                        });
                        $scope.modal.result.then(function (selectedItem) {
                            $timeout(function () {
                                updateAccountsView();
                            });
                        }, function () {
                            console.log('but i waz dizmizeddd')
                        });
                    });
            }
            $scope.clearFilter = function () {
                delete $scope.typefilter;
                $scope.userview = false;
            }
            $scope.setFilter = function (filter) {
                $scope.typefilter = filter;
                if(filter == 'user')
                    $scope.userview = true;
            }
            updateAccountsView();
            updateUsersView();
            //startTimer();
            $scope.load();
            $scope.topup = function (id) {
                $scope.recid = id;
                $scope.modal = $uibModal.open({
                    animation: true,
                    ariaLabelledBy: 'modal-title',
                    ariaDescribedBy: 'modal-body',
                    templateUrl: 'views/partials/modal-topup.html',
                    controller: 'AccountsModalController',
                    scope: $scope
                });
                $scope.modal.result.then(function (selectedItem) {
                    $timeout(function () {
                        updateAccountsView();
                    });
                }, function () {
                    console.log('but i waz dizmizeddd')
                });
            }

            $scope.editUser = function (account, id) {
                api.getUser(account, id)
                .then(function (u) {
                    $scope.user = u;
                    $scope.accid = account;
                    $scope.modal = $uibModal.open({
              animation: true,
              ariaLabelledBy: 'modal-title',
              ariaDescribedBy: 'modal-body',
              templateUrl: 'views/partials/modal-edit-user.html',
              controller : 'UserListModalController',
             scope : $scope
            });
            $scope.modal.result.then(function (selectedItem) {
               $timeout(function () {
                   updateUsersView();
               });
            }, function () {
              console.log('but i waz dizmizeddd')
            });
                })
                
            }
        
             $scope.deleteUser = function (account, id) {
                api.getUser(account, id)
                .then(function (u) {
                    $scope.user = u;
                    $scope.accid = account;
                    $scope.modal = $uibModal.open({
              animation: true,
              ariaLabelledBy: 'modal-title',
              ariaDescribedBy: 'modal-body',
              templateUrl: 'views/partials/modal-delete-user.html',
              controller : 'UserListModalController',
             scope : $scope
            });
            $scope.modal.result.then(function (selectedItem) {
               $timeout(function () {
                   updateUsersView();
               });
            }, function () {
              console.log('but i waz dizmizeddd')
            });
                })
                
            }

        } else {
            $location.path('/login');
        }

    }]);

angular.module('billinguiApp')
    .controller('AccountsModalController', ['$uibModalInstance', '$scope', 'api', '$stateParams', 'SweetAlert', function ($uibModalInstance, $scope, api, $stateParams, SweetAlert) {

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
        $scope.refundTx = function () {
            api._get('/topuplog/item/' + $scope.recid + '/refund')
                .then(function (t) {
                    $scope.rec = t;
                    SweetAlert.swal({
                        title: "Good Job!",
                        text: "TopupLog has been refunded!",
                        type: "success",
                        closeOnConfirm: true
                    }, function (ok) {
                        if (ok) {
                            $uibModalInstance.dismiss();
                        }

                    });
                })
               // $uibModalInstance.dismiss();
                $scope.modal.result.then(function (selectedItem) {
                    

                }, function () {
                    console.log('but i waz dizmizeddd')
                });
        }
        $scope.topupOK = function () {
            console.log('i am being called')
            var upd = {};
            upd.amount = $scope.top.amt;
            upd.reason = $scope.top.reason;
            api.topupAcc($scope.recid, upd)
                .then(function (up) {
                    $uibModalInstance.close();
                })
                .catch(function (err) {
                    console.log('big badaaaa boom')
                })
        }

    }]);

    angular.module('billinguiApp')
    .controller('UserListModalController', ['$uibModalInstance', '$scope', 'api', '$stateParams', function($uibModalInstance, $scope, api, $stateParams) {

         $scope.accountsCancel = function () {
        console.log('Cancel Was clicked');
        $uibModalInstance.dismiss();
    }
            $scope.uploadAvatar = function(file, errFiles) {
        $scope.f = file;
        $scope.errFile = errFiles && errFiles[0];
        if (file) {
            file.upload = Upload.upload({
                url: '/api/accounts/' + $scope.accid + '/users/' + $scope.user._id + '/avatar?token=' + $scope.profile.token,
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
     $scope.newUserCancel = function () {
        console.log('Cancel Was clicked');
        $uibModalInstance.dismiss();
    }
       $scope.cancel = function () {
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
        api.editUser($scope.accid, $scope.user._id, nobj)
            .then(function (u) {
                

            })
            .catch(function (err) {
                console.log(err);
            })
    $uibModalInstance.close();
    }
    $scope.deleteUserOK = function () {
        if ($scope.uconfirm == $scope.user.username) {
            api.deleteUser($scope.accid, $scope.user._id)
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
    $scope.editCredentialOK = function () {
        console.log('boooo booo', $scope.rec)
        api._put('/credentials/' + $scope.rec._id, $scope.rec)
            .then(function (bc) {
                $uibModalInstance.close();
            })
            .catch(function (err) {
                $uibModalInstance.dismiss(err);
            })
    }
   

    }]);
