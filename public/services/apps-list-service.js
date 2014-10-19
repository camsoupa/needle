angular.module('needle')
  .factory('appsList', ['$http',
    function($http) {
      return $http.get('/apps');
    }])
