//'use strict';

/**
 * @ngdoc function
 * @name billinguiApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the billinguiApp
 */
angular.module('billinguiApp')
  .controller('UsersController', ['$scope', 'api','$location', '$uibModal', '$timeout', function ($scope, api, $location, $uibModal, $timeout) {
      if (api.isAuthed()) {

          api.updateProfile()
            .then(function (prof) {
                $scope.profile = prof;
            })
            .catch(function (err) {
                console.log(err);
            })
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
                     $("#userlist").css('active');
          
                }
        var updateUsersView = function () {
            api.getUsers()
    .then(function (us) {
        $scope.users = us.users;
/*
        acc.accounts.forEach(function (f) {
            if (f._id == $scope.profile.main_account) {

            } else {
                $scope.accounts.push(f);
            }
        })
*/
    return api.getAccounts();
    })
    .then(function (acc) {
            var oo = [];
            acc.accounts.forEach(function (f) {
                oo[f._id] = f.account_name;
            });
            $scope.account_names = oo;
        })
    .catch(function (err) { console.log(err); });
        }
    

    updateUsersView();

    $scope.load();
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
        api.updateCredential($scope.rec.apicode, $scope.rec)
            .then(function (bc) {
                $uibModalInstance.close();
            })
            .catch(function (err) {
                $uibModalInstance.dismiss(err);
            })
    }
   

    }]);
