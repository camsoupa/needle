angular.module('needle')
  .factory('sourcesinks', ['$http', function ($http) {
      // TODO q.defer return promise
      return { 
        get: function (app) {
          return $http.get('/sourcesinks', { params: { app: app } });
        }
      }
    }])
/*
angular.module('needle')
  .factory('sourcesinks', function () { 
     return {
        get: function () {
         
        }
     }
  })
  */
