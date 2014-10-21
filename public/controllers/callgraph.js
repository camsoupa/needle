angular.module('needle')
  .controller('callgraph', ['$stateParams', '$scope', '$rootScope', '$http', '$timeout', 'report',
    function($stateParams, $scope, $rootScope, $http, $timeout, report) {
      console.log($stateParams);
      $scope.graphType = 'Local callers/callees';
      $scope.showSourceSinkOverviewGraph = function () {
       $scope.graph = 'TypeSource/Sink overview'
      }
      $scope.showSourceSinksGraph = function () {
        $scope.graphType = 'Reachable sources/sinks'
      }
      $scope.showNeighborGraph = function () {
        $scope.graphType = 'Local callers/callees'
      }

      $scope.showCallGraph = function () {
        $scope.graphType = 'Full call graph'
      }
      $scope.showClassGraph = function () {
        $scope.graphType = 'Class relationships'
      }

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

      report.get($stateParams.appName).then(function (response) {       
        var callers = response.data.methods;
        
        var methods = {};

        for (var caller in callers) {
          methods[caller] = {name: caller, calls: callers[caller].calls.length, called: 0, signature: caller}
        }
        for (var caller in callers) {
          for (var i = 0; i < callers[caller].calls.length; i++) {
            var callee = callers[caller].calls[i];
            var calleeName = callee.signature;
            if(!(callee in methods)) {
              methods[calleeName] = {
                name: calleeName, 
                calls: 0, 
                called: 1, 
                signature: calleeName, 
                isSource: callee.isSource, 
                isSink: callee.isSink
              };
            }
            methods[calleeName].called++;
          }
        }
        $scope.graph = new dagreD3.Digraph();
        $scope.methods = [];
        for(var m in methods) {
          $scope.methods.push(methods[m]);
        }
        var updateGraph = function(nodeId) {
          var placeholderNodeStyle = 'stroke: none !important; stroke-width: 0px !important; fill: none !important;';
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
              if (callee.isSource || callee.isSink) { node.style = 'fill: #ffff66'; }
              var calleeClass = getClassName(callee.signature);
              var calleeMethodName = getMethodName(callee.signature);
              if (!g.hasNode(callee.signature)) {
                var style = callee.isSink ? 'fill: #ff9966;' : callee.isSource ? 'fill: #afa;' : '';
                var nodeProperties = { label: calleeClass + '.' + calleeMethodName, style: style };
                g.addNode(callee.signature, nodeProperties);
              }
              var edgeStyle = (callee.type == 'invoke-virtual' || callee.type == 'invoke-interface') ? 'stroke: blue;' : '';
              g.addEdge(null, nodeId, callee.signature, { style: edgeStyle });
              var leaf = 'leaf:' + callee.signature;
              if (!g.hasNode(leaf)) {
                g.addNode(leaf, { 
                  label: !(callee.signature in callers) ? 'EXTERNAL' : callers[callee.signature].calls.length.toString(), 
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
              if (!g.hasNode(caller)) g.addNode(caller, { label: className + '.' + methodName });
              g.addEdge(null, caller, nodeId);
            }
          }
          $scope.graph = g;
          $scope.onClick = function(nodeId) {
            updateGraph(nodeId);
            $rootScope.$broadcast('graph_updated');
            // TODO issue a method request to pull up the file and line number
          }
        }

        $scope.$watch('selectedMethod', function (value) {
          if(value && value.data) {          
            updateGraph(value.data.signature);
            $rootScope.$broadcast('graph_updated'); 
          }
        }, true)
        
        $scope.$on('method_request', function(evt, item){
          updateGraph(item.data.signature);
          $rootScope.$broadcast('graph_updated');
        });
        $scope.$on('risk_request', function(evt, item){
          updateGraph(item.data.signature);
          $rootScope.$broadcast('graph_updated');
        });
      });
    }])
.directive('dagre', [ '$timeout', function($timeout) {
  console.log('directive');
  function link(scope, element, attrs) {
    var renderer = new dagreD3.Renderer();
    var layout = dagreD3.layout()
                        .nodeSep(20)
                        .rankDir("LR");
    // Override drawNodes to set up the hover.
    var oldDrawNodes = renderer.drawNodes();
    renderer.drawNodes(function(g, svg) {
      var svgNodes = oldDrawNodes(g, svg);
      svgNodes.on("click", function (d, i, k) {
        scope.d3Click({node: d});
      })

      return svgNodes;
    });

    scope.render = function () {
      console.log('rendering graph');
      // Set up an SVG group so that we can translate the final graph.
      var svg = d3.select('svg g');
      svg.selectAll("*").remove();

      var centerG = svg.append('g'),
          zoomG = centerG.append('g');
      
      // Set initial zoom to 75%.
      var initialScale = 0.75
      var zoom = dagreD3.zoom.panAndZoom(zoomG);
      dagreD3.zoom(svg, zoom);
      // We must set the zoom and then trigger the zoom event to synchronize D3 and
      // the DOM.
      zoom.scale(initialScale).event(svg);
      // Run the renderer. This is what draws the final graph.
      
      renderer.layout(layout).run(scope.d3Graph, zoomG);
      // Center the graph
      //var xCenterOffset = (svg.attr('width') - layout.graph().width * initialScale) / 2;
      //centerG.attr('transform', 'translate(' + xCenterOffset + ', 20)');
      //svg.attr('height', layout.graph().height * initialScale + 40);
      //svg.selectAll('.node rect').attr('class', 'node node-hover'); 
    }
    
    // this doesn't seem to be working :(
    scope.$watch('d3Graph', function(value) {
      scope.render();
    }, true);

    // ...so using this instead:
    scope.$on('graph_updated', function(evt){
      // delay rendering of graph to allow sync of d3Graph variable while avoiding $apply in $digest loop
      $timeout(function () { 
        scope.$apply()
        scope.render();
      }, 10);
    });
  }

  return {
    scope: {
        d3Graph: '=',
        d3Click: '&'
    },
    template :'<div id="dagre">' + 
                 '<svg id="svg" height="600px" width="1000px"><g transform="translate(20,20)"></g></svg>' + 
              '</div>',
    replace: true,
    restrict: 'E',
    link: link
  };
}]);
