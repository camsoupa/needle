angular.module('needle')
  .controller('SourceSinkGraphCtrl', ['$state', '$stateParams', '$scope', '$rootScope', '$http', '$timeout', 'report', 'sourcesinks',
    function($state, $stateParams, $scope, $rootScope, $http, $timeout, report, sourcesinks) {
      console.log($stateParams);
      $scope.graph = new dagreD3.Digraph();
      sourcesinks.get($stateParams.appName).then(function (response) {
        var paths = response.data;
        paths.forEach(function (path, index) {
          var from = path[0].category;
          var to = path[path.length-1].category;
          if (!$scope.graph.hasNode(from)) {
            $scope.graph.addNode(from, { label: from /*, style: rootStyle */})
          }
          if (!$scope.graph.hasNode(to)) {
            $scope.graph.addNode(to, { label: to /*, style: rootStyle */})
          }
          $scope.graph.addEdge(index, from, to);
        })
        //$scope.graph = new dagreD3.Digraph();

        
        $scope.onNodeClick = function(nodeId) {
          /* only update if the click was not a leaf in graph */
          if(nodeId.substring(0,4) != 'leaf:') {
            $rootScope.$broadcast('graph_updated');
            // TODO risks need filename and line
          }
        }
        $scope.onEdgeClick = function(edgeId) {
          $state.go('app.content.flowpathgraph', { pathId: edgeId });
        }
      })
    }])
