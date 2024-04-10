//'use strict';

/**
 * @ngdoc function
 * @name billinguiApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the billinguiApp
 */
angular.module('billinguiApp')
  .controller('NewPackageController', ['$scope', 'api','$location', '$stateParams', '$uibModal', '$timeout', function ($scope, api, $location, $stateParams, $uibModal, $timeout) {
      if (api.isAuthed()) {
          api.updateProfile()
            .then(function (prof) {
                $scope.profile = prof;
            })
            .catch(function (err) {
                console.log(err);
            })
            $scope.createPackage = function () {
                api.createPackage($stateParams.account, $scope.package)
                    .then(function (f) {
                        $location.path("/account/" + $stateParams.account + "/packages/" + f._id);
                    })
            }
      } else {
          $location.path('/login');
      }
      }]);