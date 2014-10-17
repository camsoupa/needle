angular.module('needle')
  .controller('code', ['$scope', '$rootScope', '$http', '$timeout', '$anchorScroll', '$location',
    function($scope, $rootScope, $http, $timeout, $anchorScroll, $location) {
      
      $scope.$on('risk_request', function (evt, item) {
        $http.get('file/' + item.data.filename).success(function (data) {
          var line = item.data.line;
          data.lines[line].highlight = true;
          $scope.file = data;
           $timeout(function () {
             $location.hash('line-' + Math.max(0, line-5)); 
             $anchorScroll();
           }, 20)
        });
      })
      $scope.$on('method_request', function (evt, item) {
        $http.get('file/' + item.data.filename).success(function (data) {
          var line = item.data.startLine;
          data.lines[line].highlight = true;
          $scope.file = data;
           $timeout(function () {
             $location.hash('line-' + Math.max(0, line-5));
             $anchorScroll();
           }, 20)
        });
      })
    }])
