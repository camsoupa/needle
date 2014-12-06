angular.module('needle')
  .controller('CallGraphCtrl', ['$stateParams', '$scope', '$rootScope', '$http', '$timeout', 'report',
    function($stateParams, $scope, $rootScope, $http, $timeout, report) {
      console.log($stateParams);

      function getFullClassName(method) {
        var i = method.indexOf('(');
        var qualifiedMethod = method.substring(0, i);
        i = qualifiedMethod.lastIndexOf('.');
        return qualifiedMethod.substring(0,i);
      }

      function getClassName(method) {
        var i = method.indexOf('(');
        var qualifiedMethod = method.substring(0, i);
        i = qualifiedMethod.lastIndexOf('.');
        var qualifiedClass = qualifiedMethod.substring(0,i);
        i = qualifiedClass.lastIndexOf('.');
        return qualifiedClass.substring(i+1);
      }

      function getMethodName(method) {
         var i = method.indexOf('(');
        var qualifiedMethod = method.substring(0, i);
        i = qualifiedMethod.lastIndexOf('.');
        return qualifiedMethod.substring(i+1); 
      }

      function calls(caller, callee) {
        for (var i = 0; i < caller.calls.length; i++) {
          if (caller.calls[i].signature == callee) { return true; }
        }
        return false;
      }

      /* get the call graph from the server and transform it */
      report.get($stateParams.appName).then(function (response) {       
        var callers = response.data.methods;
        
        var methods = {};

        /* transform graph into ui-friendly format (maybe should do this on server to begin with) */
        for (var caller in callers) {
          methods[caller] = {
            name: callers[caller].name, 
            filename: callers[caller].filename,
            calls: callers[caller].calls.length, 
            called: 0, 
            signature: caller, 
            risks: callers[caller].risks,
            startLine: callers[caller].startLine
          }
        }
        
        /* transform callees */
        for (var caller in callers) {
          for (var i = 0; i < callers[caller].calls.length; i++) {
            var callee = callers[caller].calls[i];;
            if(!(callee.signature in methods)) {
              methods[callee.signature] = {
                name: callee.signature, 
                calls: 0, 
                called: 1, 
                signature: callee.signature, 
                isSource: callee.isSource, 
                isSink: callee.isSink
              };
            }
            methods[callee.signature].called++;
          }
        }
        
        $scope.graph = new dagreD3.Digraph();
        $scope.methods = [];
        for(var m in methods) {
          $scope.methods.push(methods[m]);
        }

        /* called when the graph is clicked or when a method or risk is clicked in the left panel */
        var updateGraph = function(nodeId) {
          /* TODO based on current graph type, change behavior of updateGraph */
          var placeholderNodeStyle = 
            'stroke: none !important; stroke-width: 0px !important; fill: none !important;';
          var g = new dagreD3.Digraph();
          var root = callers[nodeId];
          var className = getClassName(nodeId);
          var methodName = getMethodName(nodeId);
          var method = methods[nodeId];
          var rootStyle = method.isSink ? 'fill: #ff9966;' : method.isSource ? 'fill: #afa;' : '';
          g.addNode(nodeId, { label: className + '.' + methodName, style: rootStyle })
          var node = g.node(nodeId);
          if (root) {
            for (var i = 0; i < root.calls.length; i++) { 
              var callee = root.calls[i];
              if (callee.isSource || callee.isSink) { node.style = 'fill: #ffff66;'; }
              var calleeClass = getClassName(callee.signature);
              var calleeMethodName = getMethodName(callee.signature);
              if (!g.hasNode(callee.signature)) {
                var calleeNodeStyle = '';
                if (callee.isSink) { 
                  calleeNodeStyle = 'fill: #ff9966;';
                } else if (callee.isSource) {
                  calleeNodeStyle = 'fill: #afa;';
                } else if (methods[callee.signature].risks
                           && methods[callee.signature].risks.length > 0) {
                  calleeNodeStyle = 'fill: #ffff66;';
                }
                g.addNode(callee.signature, { 
                  label: calleeClass + '.' + calleeMethodName,
                  style: calleeNodeStyle 
                });
              }
              var edgeStyle = 
                (callee.type == 'invoke-virtual' || callee.type == 'invoke-interface') 
                  ? 'stroke: blue;' : '';
              g.addEdge(null, nodeId, callee.signature, { style: edgeStyle });
              var leaf = 'leaf:' + callee.signature;
              if (!g.hasNode(leaf)) {
                g.addNode(leaf, { 
                  label: !(callee.signature in callers) 
                    ? 'EXTERNAL' : callers[callee.signature].calls.length.toString(), 
                  style: placeholderNodeStyle 
                });
                g.addEdge(null, callee.signature, leaf);
              }
            }
          } else {
            var leaf = 'leaf:' + nodeId;
            if (!g.hasNode(leaf)) {
              g.addNode(leaf, { label: 'EXTERNAL', style: placeholderNodeStyle });
              g.addEdge(null, nodeId, leaf);
            }
          }
          
          for (var caller in callers) {
            var className = getClassName(caller);
            var methodName = getMethodName(caller);
            if (calls(callers[caller], nodeId)) {
              if (!g.hasNode(caller)) {
                g.addNode(caller, { 
                  label: className + '.' + methodName, 
                  style: (callers[caller].risks && callers[caller].risks.length > 0) 
                    ? 'fill: #ffff66;' : ''
                });
              }
              g.addEdge(null, caller, nodeId);
            }
          }
          $scope.graph = g;
          $scope.onNodeClick = function(nodeId) {
            /* only update if the click was not a leaf in graph */
            if(nodeId.substring(0,4) != 'leaf:') {
              updateGraph(nodeId);
              $rootScope.$broadcast('graph_updated');
              $rootScope.$broadcast('callgraph_method_request', methods[nodeId], $stateParams.appName);
            }
          }
          $scope.onEdgeClick = function(edgeId) {
            console.log(edgeId);
          }
        }

        /* when a graph node is selected, update the graph */
        $scope.$watch('selectedMethod', function (value) {
          if(value && value.data) {          
            updateGraph(value.data.signature);
            $rootScope.$broadcast('graph_updated'); 
          }
        }, true)
        
        /* when a method item in the left sidepanel is clicked, update the graph */
        $scope.$on('method_request', function(evt, methodDef){
          updateGraph(methodDef.signature);
          $rootScope.$broadcast('graph_updated');
        });
        
        /* when a risk item in the left sidepanel is clicked, update the graph */
        $scope.$on('risk_request', function(evt, risk){
          updateGraph(risk.signature);
          $rootScope.$broadcast('graph_updated');
        });
      });
    }])
