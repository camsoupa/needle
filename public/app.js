angular.module('needle', [ 'ui.router', 'ui.tree', 'angucomplete', 'ui.layout', 'ngSanitize', 'ui.bootstrap'])
  .run([     '$rootScope', '$state', '$stateParams', '$anchorScroll',
    function ($rootScope,   $state,   $stateParams, $anchorScroll) {
      $rootScope.$state = $state;
      $rootScope.$stateParams = $stateParams;
      $anchorScroll.yOffset = -50;
    }
  ])
  .config([ '$logProvider', '$stateProvider', '$urlRouterProvider',
    function ($logProvider, $stateProvider,   $urlRouterProvider) {
      $logProvider.debugEnabled(true);
      $stateProvider
        .state('appslist',  {
          url: '',
          views: {
           'breadcrumb': {
              template: '<div><ol class="breadcrumb"><li class="text-danger"><b>apps</b></li></ol></div>'
            },
            '' : {
              templateUrl: 'apps.html',
              controller: 'apps',
              onEnter: function ($state) {
                console.log('apps state entered');
              }
            }
          }
        })
        .state('app', {
          url: '/:appName',
          abstract: true,
          views: {
           'breadcrumb': {
              templateUrl: 'app.header.html',
              controller: [ '$scope', '$rootScope', '$stateParams', 'search', function ($scope, $rootScope, $stateParams, search) {
                $scope.appName = $stateParams.appName;
                $scope.query = function () { 
                  search.search({ query: $scope.searchText, app: $scope.appName }, function (data) {
                    console.log(data);
                    $rootScope.$broadcast('search_results', data);
                  });
                }
                $scope.clear = function () { $scope.searchText = ''; }
              }]
            },
            '' : {
              templateUrl: 'app.html'
            }
          }
        })
        .state('app.content', {
          url: '',
          abstract: true,
          views: {
            sidepanel: {
              templateUrl: 'sidepanel.html',
              controller: 'SidePanelCtrl'  
            },
            graph: {
              templateUrl: 'graph.html',
              controller: 'GraphCtrl'
            },
            code: {
              templateUrl: 'code.html',
              controller: 'CodeCtrl'
            }
          }
        })
        .state('app.content.ssgraph', {
          url: '/ssgraph',
          views: {
            'graphContainer': {
              templateUrl: 'dagre.html',
              controller: 'SourceSinkGraphCtrl'
            }
          }
        })
        .state('app.content.callgraph', {
          url: '',
          views: {
            'graphContainer': {
              templateUrl: 'dagre.html',
              controller: 'CallGraphCtrl'
            }
          }
        })
        .state('app.content.classgraph', {
          url: '/class-graph',
          views: {
            'graphContainer': {
              templateUrl: 'dagre.html',
              controller: 'ClassGraphCtrl'
            }
          }
        })
        .state('app.content.flowpathgraph', {
          url: '/paths/:pathId',
          views: {
            'controls@app.content' : {
              template: ' <a ui-sref="app.content.ssgraph()"><span class="glyphicon glyphicon-zoom-out"></span></a>',
            },
            'graphContainer': {
              templateUrl: 'dagre.html',
              controller: 'FlowPathGraphCtrl'
            }
          }
        })
      }])
