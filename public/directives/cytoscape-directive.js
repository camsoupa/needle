angular.module('needle')
  .directive('cytoscape', [ '$rootScope', '$timeout', function($rootScope, $timeout) {
    // graph visualisation by - https://github.com/cytoscape/cytoscape.js
    return {
        restrict: 'E',
        template :'<div id="cy" style="height: 600px; width: 1000px;"></div>',
        replace: true,
        scope: {
            // data objects to be passed as an attributes - for nodes and edges
            cyNodes: '=',
            cyEdges: '=',
            // controller function to be triggered when clicking on a node
            cyClick:'&'
        },
        link: function(scope, element, attrs, fn) {

            // graph  build
            scope.doCy = function(){ // will be triggered on an event broadcast
                // initialize data object
                scope.elements = {
                  nodes: scope.cyNodes,
                  edges: scope.cyEdges
                };


                // graph  initialization
                // use object's properties as properties using: data(propertyName)
                // check Cytoscapes site for much more data, options, designs etc
                // http://cytoscape.github.io/cytoscape.js/
                // here are just some basic options
                cytoscape({
                    container: document.getElementById('cy'),
                    layout: {
                        name: 'dagre',
                        fit: true, // whether to fit the viewport to the graph
                        ready: undefined, // callback on layoutready
                        stop: undefined, // callback on layoutstop
                        padding: 5 // the padding on fit
                    },
                    style: cytoscape.stylesheet()
                        .selector('node')
                        .css({
                            'shape': 'rectangle',
                            'width': '150',
                            'height': 'data(weight)',
                            'background-color': 'data(color)',
                            'content': 'data(id)',
                            'text-valign': 'center',
                            'color': 'white',
                            'text-outline-width': 2,
                            'font-size' : 'xx-large',
                            'text-outline-color': 'data(color)'
                        })
                        .selector('edge')
                        .css({
                            'width': '10',
                            'line-color': 'black',
                            'color' : 'red',
                            'content' : 'data(weight)',
                            'target-arrow-shape': 'triangle',
                            'font-size' : 'xx-large',
                            'target-arrow-color': 'red'
                        })
                        .selector(':selected')
                        .css({
                            'background-color': 'green',
                            'line-color': 'black',
                            'target-arrow-color': 'black',
                            'source-arrow-color': 'black'
                        })
                        .selector('.faded')
                        .css({
                            'opacity': 0.65,
                            'text-opacity': 0.65
                        }),
                        ready: function(){
                        window.cy = this;

                        // giddy up...
                        cy.elements().unselectify();

                        // Event listeners
                        // with sample calling to the controller function as passed as an attribute
                        cy.on('tap', 'node', function(e){
                            var evtTarget = e.cyTarget;
                            var nodeId = evtTarget.id();
                            scope.cyClick({value:nodeId});
                        });

                        // load the objects array
                        // use cy.add() / cy.remove() with passed data to add or remove nodes and edges without rebuilding the graph
                        // sample use can be adding a passed variable which will be broadcast on change
                        cy.load(scope.elements);
                    }
                });

            }; // end doCy()

            //$timeout(scope.doCy, 0);

            // When the app object changed = redraw the graph
            // you can use it to pass data to be added or removed from the object without redrawing it
            // using cy.remove() / cy.add()
            $rootScope.$on('graphChanged', function(){
                scope.doCy();
            });
        }
    };
}]);
