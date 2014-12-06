angular.module('needle')
  .controller('SourceSinkGraphCtrl', ['$state', '$stateParams', '$scope', '$rootScope', '$http', '$timeout', 'sourcesinks',
    function($state, $stateParams, $scope, $rootScope, $http, $timeout, sourcesinks) {
      console.log($stateParams);
      $scope.graph = new dagreD3.Digraph();
      sourcesinks.get($stateParams.appName).then(function (response) {
        var paths = response.data;
        paths.forEach(function (path, index) {
          var from = path[0].category + ' (SOURCE)';
          var to = path[path.length-1].category + ' (SINK)';
          
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

        $scope.onNodeClick = function(nodeId) {
          console.log(nodeId);
        }
        $scope.onEdgeClick = function(edgeId) {
          $state.go('app.content.flowpathgraph', { pathId: edgeId });
        }
      })
    }])
