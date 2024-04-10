//'use strict';

/**
 * @ngdoc function
 * @name billinguiApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the billinguiApp
 */
angular.module('billinguiApp')
  .controller('LoginCtrl', ['$scope', 'api','$location', function ($scope, api, $location) {
      if (api.isAuthed()) {
          $location.path('/');
      }
    $scope.authenticate = function () {
        var user = $scope.user;
        api.login(user)
        .then(function (profile) {
            api.setProfile(profile);
            $location.path('/dashboard');
        })
        .catch(function (err) {
            if (err.status == '401') {
                //unauth
                $scope.err = true;
                $scope.user.username = '';
                $scope.user.password = '';
            }
        })
    };
  }]);
