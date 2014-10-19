var myapp = angular.module('needle')
  .controller('calltree', [ '$stateParams', '$scope', '$rootScope', 'report',
    function($stateParams, $scope, $rootScope, report) {
    console.log($stateParams);
    // TODO make filterable with: https://github.com/ee/angular-ui-tree-filter
    $scope.pattern = '';
    $scope.treeState = 'By method';
    $scope.byRank = function () { 
      $scope.treeState = 'By rank'; 
      // use states to transition to a sibling state - put tree into a template and load in ui-view as child state    
    }
    $scope.byClass = function () { 
      $scope.treeState = 'By class'; 
      // use states to transition to a sibling state - put tree into a template and load in ui-view as child state    
    }
    $scope.byMethod = function () { 
      $scope.treeState = 'By method'; 
      // use states to transition to a sibling state - put tree into a template and load in ui-view as child state    
    }
    $scope.toggle = function (scope) { scope.toggle(); }
    $scope.onRiskClicked = function (item) { 
      console.log(item.title);
      $rootScope.$broadcast('risk_request', item, $stateParams.appName);
    }
    $scope.onMethodClicked = function (item) { 
      console.log(item.title);
      $rootScope.$broadcast('method_request', item, $stateParams.appName);
    }
    $scope.filter = function (item, pat) { 
      // TODO consider memoizing this func
      if (pat == '') return false;
      var shouldHide = item.title.indexOf(pat) == -1;
      if (shouldHide && item.items != null) {
        for (var i = 0; i < item.items.length; i++) {
          if (!$scope.filter(item.items[i], pat)) return false;
        }
      }
      return shouldHide;
    }
 
    function getPkg(clazz) {
      var parts = clazz.split('/');
      parts.pop();
      return parts.join('.');
    }

    function getClassName(clazz) {
      var parts = clazz.split('/');
      return parts.pop();
    }

    function abbrev(str) {
      return str.substring(0,10) + '...' + getClassName(str);
    }

    var id = 0;
    var pkgs = {};
    
    report.get($stateParams.appName).then(function (response) {
      $scope.pkgs = [];
      var prog = response.data;
      for (var clazz in prog.classes) {
        var pkg = getPkg(clazz);  
        if (!(pkg in pkgs)) {
          pkgs[pkg] = {
            id: ++id,
            title: ' ' + pkg,
            items: []
          };
        }

        var methodSigs = prog.classes[clazz].methods;
        var methods = [];
        for (var i = 0; i < methodSigs.length; i ++) {
          var m = prog.methods[methodSigs[i]];
          m.filename = pkg + '.' + prog.classes[clazz].file.replace('.java', '');
          m.signature = methodSigs[i];
          var risks = [];
          if (m.risks) {
            for(var j = 0; j < m.risks.length; j++) {
              var r = m.risks[j];
              r.filename = m.filename;
              risks.push({ id: ++id, title: 'risk: ' + abbrev(r.name) + ' ' + r.category, data: r })
            }     
          }
          methods.push({ id: ++id, title: m.name, items: risks, data: m })
        }
        pkgs[pkg].items.push({
          id: ++id,
          title: getClassName(clazz),
          items: methods
        })
      }
      for (var pkg in pkgs) {
        $scope.pkgs.push(pkgs[pkg]);
      }
      $scope.$apply();
    })
   }])
