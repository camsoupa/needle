angular.module('needle')
  .controller('CryptoGraphCtrl', 
           ['$stateParams', '$scope', '$rootScope', '$http', '$timeout', 'cryptoflows',
    function($stateParams, $scope, $rootScope, $http, $timeout, cryptoflows) {
      console.log($stateParams);
      $scope.graph = new dagreD3.Digraph();
      
      cryptoflows.get($stateParams.appName).then(function (res) {
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
      }) 
  }])
