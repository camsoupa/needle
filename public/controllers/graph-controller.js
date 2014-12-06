angular.module('needle')
  .controller('GraphCtrl', ['$state', '$stateParams', '$scope', '$rootScope', '$http', '$timeout', 'report',
    function($state, $stateParams, $scope, $rootScope, $http, $timeout, report) {
      console.log($stateParams);
 
      var GRAPH_NEIGHBORS, /* show graph for method when clicked in left panel */
          GRAPH_SRC_SNK, /* show graph for method when selected in drop down */
          GRAPH_CRYPTO,
          GRAPH_CLASSES;

      $scope.graphLabels = [
        'Local callers/callees',
        'Source/sink flows',
        'Crypto flows',
        'Class relationships'
      ];

      $scope.graphTypes = [
        GRAPH_NEIGHBORS = 0,
        GRAPH_SRC_SNK = 1,
        GRAPH_CRYPTO = 2,
        GRAPH_CLASSES = 3
      ];

      $scope.selectedGraphType = GRAPH_SRC_SNK;

      $scope.showGraph = function (type) {
        $scope.selectedGraphType = type;
        if (type == GRAPH_NEIGHBORS)
          $state.go('app.content.callgraph', $stateParams);
        else if (type == GRAPH_SRC_SNK)
          $state.go('app.content.ssgraph', $stateParams);
        else if (type == GRAPH_CRYPTO)
          $state.go('app.content.cryptograph', $stateParams);
        else if (type == GRAPH_CLASSES)
          $state.go('app.content.classgraph', $stateParams);
      }
    }])
 
