angular.module('needle')
  .factory('cryptoflows', ['$http', function ($http) {
      // TODO q.defer return promise
      return { 
        get: function (app) {
          return $http.get('/cryptoflows', { params: { app: app } });
        }
      }
    }])
