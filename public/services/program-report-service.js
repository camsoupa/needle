angular.module('needle')
  .factory('report', ['$http',
    function($http) {
      // TODO q.defer return promise
      return { 
        get: function (app) {
          return $http.get('/callgraph', { params: { app: app } });
        }
      }
    }])
