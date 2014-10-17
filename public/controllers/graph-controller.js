function getClassName(method) {
  var i = method.indexOf('(');
  var qualifiedMethod = method.substring(0, i);
  i = qualifiedMethod.lastIndexOf('.');
  return qualifiedMethod.substring(0,i);
}

function getMethodName(method) {
   var i = method.indexOf('(');
  var qualifiedMethod = method.substring(0, i);
  i = qualifiedMethod.lastIndexOf('.');
  return qualifiedMethod.substring(i); 
}

function isLibCall(method) {
  return method.indexOf('java.') == 0 || method.indexOf('android.') == 0 || 
         method.indexOf('javax.') == 0 || method.indexOf('org.apache.') == 0 || 
         method.indexOf('org.osmdroid') == 0;
}

/*
{
  class1: { 
    count: 1, 
    classRef: { 
      class2: { 
        methodRef: { 
          class2MethodName: 1,
          ... 
        } 
      },
      ...
    }
  },
  ...
}
*/

angular.module('needle')
  .controller('GraphCtrl',
           [ '$scope', '$rootScope', '$stateParams', '$http', '$timeout',
    function ($scope,   $rootScope,   $stateParams, $http, $timeout) {
      $http.get('controllers/call_graph.json').success(function (data) {
        var nodes = {};
        var callers = data.call_graph;
        for (var caller in callers) {
          if(!isLibCall(caller)) {
            var className = getClassName(caller);
            if (nodes[className] == null) nodes[className] = { count: 0, classRef: {} };
            for (var i = 0; i < callers[caller].calls.length; i++) { 
              var callee = callers[caller].calls[i];
              var calleeClass = getClassName(callee.method);
              var methodName = getMethodName(callee.method);
              var callsToClass = nodes[className].classRef[calleeClass];
              if (callsToClass == null) nodes[className].classRef[calleeClass] = { count: 0, methodRef: {} };
              nodes[className].classRef[calleeClass].count += 1;
              var methodRef = nodes[className].classRef[calleeClass].methodRef[methodName];
              if (methodRef == null) nodes[className].classRef[calleeClass].methodRef[methodName] = 0;
              nodes[className].classRef[calleeClass].methodRef[methodName] += 1;
            }
          }
        }
        
        $scope.nodes = [];
        $scope.edges = [];
        for (var node in nodes) {
            $scope.nodes.push({ data: { id: node, color: '#222299', weight: 90 + (100 * nodes[node].count) } });
            for (var callee in nodes[node].classRef) {
              if (!(callee in nodes) && !isLibCall(callee))  {
                $scope.nodes.push({data: {id: callee, color: '#333333', weight: 90 } });  
              }
              if (!isLibCall(callee) && callee != node)
                $scope.edges.push({ data: { source: node, target: callee, weight: nodes[node].classRef[callee].count } });
            }
        }
        $timeout(function () {
          $rootScope.$broadcast('graphChanged'); 
        }, 0); 
      });
    }]);
