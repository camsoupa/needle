angular.module('needle', ['ui.router', 'ui.tree', 'angucomplete', 'ui.layout', 'ngSanitize', 'ui.bootstrap'])
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
        .state('apps',  {
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
          views: {
           'breadcrumb': {
              template: '<ol class="breadcrumb"><li><a ui-sref="apps" class="text-danger"><b>apps</b></li><li class="text-primary"><b>{{appName}}</b></li></ol>',
              controller: [ '$scope', '$stateParams', function ($scope, $stateParams) {
                $scope.appName = $stateParams.appName;
              }]
            },
            '' : {
              templateUrl: 'app.html'
            }
          }
        })
      }])
