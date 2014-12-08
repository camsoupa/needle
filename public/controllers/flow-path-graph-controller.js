angular.module('needle')
  .controller('FlowPathGraphCtrl', ['$state', '$stateParams', '$scope', '$rootScope', '$http', '$timeout', 'sourcesinks',
    function($state, $stateParams, $scope, $rootScope, $http, $timeout, sourcesinks) {
      console.log($stateParams);
      $scope.graph = new dagreD3.Digraph();
      $scope.orient = "TB";
      
      sourcesinks.get($stateParams.appName).then(function (res) {
        var path = res.data[$stateParams.pathId];
        path.forEach(function (n, index) {
          var cat = n.category ? n.category + '\n' : '';
          var label = cat + n.className + ':' + n.line + '\n' + n.stmt;
          $scope.graph.addNode(index, { label: label/*, style: rootStyle */})
          if (index > 0) {
            $scope.graph.addEdge(null, index-1, index);
          }
        })
        $scope.onNodeClick = function(nodeId) {
          console.log(nodeId);
          $rootScope.$broadcast('risk_request', path[nodeId], $stateParams.appName);
        }
        $scope.onEdgeClick = function(edgeId) {
          console.log(edgeId);
        }
        $timeout(function () {
          $rootScope.$broadcast('graph_updated');
          $scope.$apply();
        }, 5);
        
      })      
    }])
