//'use strict';

/**
 * @ngdoc function
 * @name billinguiApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the billinguiApp
 */
angular.module('billinguiApp')
  .controller('SidebarCtrl', ['$scope', 'api','$location', '$uibModal', '$timeout', '$translate', function ($scope, api, $location, $uibModal, $timeout, $translate) {
      if (api.isAuthed()) {
          api.getProfile()
    .then(function (prof) {
        $scope.profile = prof;
        if (typeof prof.avatar !== 'undefined') {
            $scope.avatarUrl = '/img/' + prof.avatar;
        } else {
            $scope.avatarUrl = 'images/placeholders/avatars/avatar.png';
        }
        $scope.lang = $translate.proposedLanguage() || $translate.use();

    });
    $scope.setLang = function () {
        $translate.use($scope.lang);
    }
    $scope.editProfile = function () {
         api.getUser($scope.profile.main_account, $scope.profile._id)
        .then(function (u) {
            $scope.user = u;
            $scope.modal = $uibModal.open({
      animation: true,
      ariaLabelledBy: 'modal-title',
      ariaDescribedBy: 'modal-body',
      templateUrl: 'views/partials/modal-edit-user.html',
      controller : 'SidebarModalController',
     scope : $scope
    });
    $scope.modal.result.then(function (selectedItem) {
       $timeout(function () {
        api.updateProfile()
            .then(function (prof) {
                $scope.profile = prof;
            })
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
    .controller('SidebarModalController', ['$uibModalInstance', '$scope', 'api', '$stateParams', 'Upload', function($uibModalInstance, $scope, api, $stateParams, Upload) {
                  $scope.load = function () {
                      console.log('ARRRGGGH')
                      console.log($('.active'))
                    }
      $scope.newUserCancel = function () {
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
        api.editUser($scope.profile.main_account, $scope.profile._id, nobj)
            .then(function (u) {
                $uibModalInstance.close();
            })
            .catch(function (err) {
                $uibModalInstance.dismiss(err);
            })
      }
      $scope.uploadAvatar = function(file, errFiles) {
        $scope.f = file;
        $scope.errFile = errFiles && errFiles[0];
        if (file) {
            file.upload = Upload.upload({
                url: '/v1/accounts/' + $scope.profile.main_account + '/users/' + $scope.profile._id + '/avatar?token=' + $scope.profile.token,
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
      $scope.load();
    }]);
