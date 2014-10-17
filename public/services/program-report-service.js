angular.module('needle')
  .factory('report', ['$http',
    function($http) {
      // TODO q.defer return promise
      return $http.get('/callgraph/Memotis');
    }])
