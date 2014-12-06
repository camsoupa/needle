angular.module('needle') 
 .directive('dagre', [ '$timeout', function($timeout) {
    console.log('dagre-directive loading');
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
          scope.d3NodeClick({node: d});
        })

        return svgNodes;
      });
      
      var oldDrawEdges = renderer.drawEdgePaths();
      renderer.drawEdgePaths(function(g, svg) {
          var edges = oldDrawEdges(g, svg);
          edges.on('click', function (edgeId) { 
            scope.d3EdgeClick({edge: edgeId});
          });
          return edges;
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
          d3NodeClick: '&',
          d3EdgeClick: '&',
      },
      template :'<div id="dagre">' + 
                   '<svg id="svg" height="600px" width="1000px"><g transform="translate(20,20)"></g></svg>' + 
                '</div>',
      replace: true,
      restrict: 'E',
      link: link
    };
  }]);
