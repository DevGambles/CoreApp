//'use strict';

/**
 * @ngdoc function
 * @name billinguiApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the billinguiApp
 */
angular.module('billinguiApp')
  .controller('NewItemController', ['$scope', 'api','$location', '$stateParams', '$uibModal', '$timeout', function ($scope, api, $location, $stateParams, $uibModal, $timeout) {
      if (api.isAuthed()) {
          api.updateProfile()
            .then(function (prof) {
                $scope.profile = prof;
            })
            .catch(function (err) {
                console.log(err);
            })
            $scope.createItem = function () {
                api.createItem($stateParams.account, $scope.item)
                    .then(function (f) {
                        $location.path("/account/" + $stateParams.account + "/items/" + f._id);
                    })
            }
      } else {
          $location.path('/login');
      }
      }]);