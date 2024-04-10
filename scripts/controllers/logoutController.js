//'use strict';

/**
 * @ngdoc function
 * @name billinguiApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the billinguiApp
 */
angular.module('billinguiApp')
  .controller('LogoutController', ['$scope', 'api','$location', '$window', function ($scope, api, $location, $window) {
      $window.localStorage.removeItem('profile');
      $window.localStorage.removeItem('token');
      $window.location.href = '/';
  }]);
