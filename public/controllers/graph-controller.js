angular.module('needle')
  .controller('GraphCtrl', ['$state', '$stateParams', '$scope', '$rootScope', '$http', '$timeout', 'report',
    function($state, $stateParams, $scope, $rootScope, $http, $timeout, report) {
      console.log($stateParams);
 
      var GRAPH_NEIGHBORS, /* show graph for method when clicked in left panel */
          GRAPH_SRC_SNK; /* show graph for method when selected in drop down */

      $scope.graphLabels = [
        'Local callers/callees',
        'Source/sink flows',
      ];

      $scope.graphTypes = [
        GRAPH_NEIGHBORS = 0,
        GRAPH_SRC_SNK = 1,
      ];

      $scope.selectedGraphType = GRAPH_NEIGHBORS;

      $scope.showGraph = function (type) {
        $scope.selectedGraphType = type;
        if (type == GRAPH_NEIGHBORS)
          $state.go('app.content.callgraph', $stateParams);
        else if (type == GRAPH_SRC_SNK)
          $state.go('app.content.ssgraph', $stateParams);
      }
    }])
 
