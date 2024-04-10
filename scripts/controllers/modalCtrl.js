//'use strict';

/**
 * @ngdoc function
 * @name billinguiApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the billinguiApp
 */
angular.module('billinguiApp')
  .controller('ModalCtrl', ['$scope', 'api','$location', function ($scope, api, $location) {
      if (api.isAuthed()) {
          api.getProfile()
    .then(function (prof) {
        $scope.profile = prof;
    });
      } else {
          $location.path('/login');
      }
    
  }]);
