angular.module('needle')
  .controller('SourceSinkGraphCtrl', ['$state', '$stateParams', '$scope', '$rootScope', '$http', '$timeout', 'sourcesinks',
    function($state, $stateParams, $scope, $rootScope, $http, $timeout, sourcesinks) {
      console.log($stateParams);
      $scope.graph = new dagreD3.Digraph();
      sourcesinks.get($stateParams.appName).then(function (response) {
        var paths = response.data;
        paths.forEach(function (path, index) {
          var fromCat = path[0].category ? path[0].category[0] : '';
          var toCat =   path[path.length-1].category ? path[path.length-1].category[0] : '';
          var from = fromCat + ' (SOURCE)';
          var to = toCat + ' (SINK)';
          
          if (from && !$scope.graph.hasNode(from)) {
            $scope.graph.addNode(from, { label: from /*, style: rootStyle */})
          }
          if (to && !$scope.graph.hasNode(to)) {
            $scope.graph.addNode(to, { label: to /*, style: rootStyle */})
          }
          
          if (to && from) { 
            $scope.graph.addEdge(index, from, to);
          }
        })
      })
      
      $scope.onNodeClick = function(nodeId) {
        console.log(nodeId);
      }
      $scope.onEdgeClick = function(edgeId) {
        $state.go('app.content.flowpathgraph', { pathId: edgeId });
      }
    }])
