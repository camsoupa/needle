var myapp = angular.module('needle')
  .controller('calltree', [ '$stateParams', '$scope', '$rootScope', 'report',
    function($stateParams, $scope, $rootScope, report) {
    console.log($stateParams);
    // TODO make filterable with: https://github.com/ee/angular-ui-tree-filter
    $scope.pattern = '';
    $scope.treeState = 'By method';
    $scope.byRank = function () { 
      $scope.treeState = 'By rank'; 
      // use states to transition to a sibling state - 
      // put tree into a template and load in ui-view as child state    
    }
    $scope.byClass = function () { 
      $scope.treeState = 'By class'; 
      // use states to transition to a sibling state - 
      // put tree into a template and load in ui-view as child state    
    }
    $scope.byMethod = function () { 
      $scope.treeState = 'By method'; 
      // use states to transition to a sibling state - 
      // put tree into a template and load in ui-view as child state    
    }
    
    /* toggle collapsed status */
    $scope.toggle = function (scope) { scope.toggle(); }
    
    /* when a risk item is clicked broadcast a msg for other components to handle */
    $scope.onRiskClicked = function (item) { 
      console.log(item.title);
      $rootScope.$broadcast('risk_request', item.data, $stateParams.appName);
    }
    
    /* when a method is clicked broadcast a msg for other components to handle */
    $scope.onMethodClicked = function (item) { 
      console.log(item.title);
      $rootScope.$broadcast('method_request', item.data, $stateParams.appName);
    }
    
    /* when a filter msg is typed this method gets fired */
    $scope.filter = function (item, pat) { 
      // TODO consider memoizing this func if it is slow for large trees
      if (pat == '') return false;

      // show if an ancestor should show
      var parent = item.parent;
      while (parent) {
        if(parent.title.indexOf(pat) >= 0) {
          return false;
        }
        parent = parent.parent;
      }

      var shouldShow = item.title.indexOf(pat) >= 0;
      // if this item does not match the pattern, check the children
      // if a single child matches, show the item
      if (!shouldShow && item.items != null) {
        for (var i = 0; i < item.items.length; i++) {
          if (!$scope.filter(item.items[i], pat)) return false;
        }
      }
      return !shouldShow;
    }
 
    function getPkg(clazz) {
      var parts = clazz.split('.');
      parts.pop();
      return parts.join('.');
    }

    function getClassName(clazz) {
      var parts = clazz.split('.');
      return parts.pop();
    }

    function abbrev(str) {
      return str.split('.').slice(-2).join('.');
    }

    var id = 0;
    var pkgs = {};
    
    /* build the left sidepanel tree view of pkg->method->risk */
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
        var classItem = {
          id: ++id,
          title: getClassName(clazz),
          parent: pkgs[pkg],
          items: []
        }
        var methodSigs = prog.classes[clazz].methods;
        for (var i = 0; i < methodSigs.length; i ++) {
          var m = prog.methods[methodSigs[i]];
          m.filename = pkg + '.' + prog.classes[clazz].file.replace('.java', '');
          m.signature = methodSigs[i];
          var method = { id: ++id, title: m.name, items: [], parent: classItem, data: m }
          if (m.risks) {
            for(var j = 0; j < m.risks.length; j++) {
              var r = m.risks[j];
              r.filename = m.filename;
              var riskTitle =  (r.isSource ? 'SOURCE' : (r.isSink ? 'SINK' : '')) + 
                ' ' + abbrev(r.name) + ' (' + r.category + ')';
              method.items.push({ id: ++id, title: riskTitle, parent: method, data: r })
            }     
          }
          classItem.items.push(method)
        }
        pkgs[pkg].items.push(classItem)
      }
      for (var pkg in pkgs) {
        $scope.pkgs.push(pkgs[pkg]);
      }
      $scope.$apply();
    })
   }])
