angular.module('needle', ['ui.router', 'ui.tree', 'angucomplete', 'ui.layout', 'ngSanitize'])
  .config(function($logProvider){
      $logProvider.debugEnabled(true);
  })
  .run([     '$rootScope', '$state', '$stateParams', '$anchorScroll',
    function ($rootScope,   $state,   $stateParams, $anchorScroll) {
      $rootScope.$state = $state;
      $rootScope.$stateParams = $stateParams;
      $anchorScroll.yOffset = -50;
    }
  ]);
