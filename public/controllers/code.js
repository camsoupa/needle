angular.module('needle')
  .controller('code', ['$scope', '$rootScope', '$http', '$timeout', '$anchorScroll', '$location',
    function($scope, $rootScope, $http, $timeout, $anchorScroll, $location) {
      
      $scope.$on('risk_request', function (evt, item) {
        $http.get('file/' + item.filename).success(function (data) {
          var line = 40; //TODO change to a non-fixed value
          data.lines[40].highlight = true;
          $scope.file = data;
           $timeout(function () {
             $location.hash('line-' + Math.max(0, line-5)); 
             $anchorScroll();
           }, 10)
        });
      })
      $scope.$on('method_request', function (evt, item) {
        $http.get('file/' + item.filename).success(function (data) {
          data.lines[40].highlight = true;
          $scope.file = data;
           $timeout(function () {
             $location.hash('line-' + 40);
             $anchorScroll();
           }, 10)
        });
      })
    }])
