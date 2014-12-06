angular.module('needle')
  .controller('apps', ['$timeout', '$scope', '$rootScope', 'appsList',
    function($timeout, $scope, $rootScope, appsList) {
      $scope.pattern = '';
      $scope.toggle = function (scope) { scope.toggle(); }
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
      var getRootNodesScope = function() {
        return angular.element(document.getElementById("apps-tree-root")).scope();
      };

      $scope.collapseAll = function() {
        var scope = getRootNodesScope();
        $timeout(function () {
          scope.collapseAll();
          scope.$apply();
        }, 5);
      };

      $scope.expandAll = function() {
        var scope = getRootNodesScope(); 
        $timeout(function () {
          scope.expandAll();
          scope.$apply();
        }, 5);
      };

      /* get the app manifest properties and show apps in a list */
      appsList.then(function (response) {
        var apps = response.data.apps;
        var id = 0;
        function getPermissions(app) {
          var perms = app.parsed.manifest['uses-permission'];
          var list = perms ? perms.map(function (perm) { 
            if (perm['attributes']['android:name'] == null) {
              console.log(perm);
              return;
            }
            return perm['attributes']['android:name']; 
          }).filter(function (perm) { return perm != null; })  : [ ];
          var unique = {};
          list.forEach(function (p) { unique[p] = true; })
          list = [];
          for (var u in unique) {
            list.push(u);
          }
          return list.map(function (item) { return {id: ++id, title: item }; })
        }
        function getFeatures(app) {
          var feats = app.parsed.manifest['uses-feature'];
          return feats ? feats
            .map(function (feat) {
              if (feat['attributes']['android:name'] == null) {
                console.log(feat);
                return;
              }
              return feat['attributes']['android:name']; 
            })
            .filter(function (feat) { return feat != null; })
            .map(function (item) { return {id: ++id, title: item }; }) : [];
        }

        function getAllIntentFilters(app) {
          var actions = {};
          app.parsed.manifest['application'].forEach(function (appl) {
            var types = ['service', 'activity', 'receiver'];

            types.forEach(function (t) {
              if (t in appl) {
                appl[t].forEach(function (component) {
                  var cName = component['attributes']['android:name'];
                  var cExported = component['attributes']['android:exported'];
                  if (cExported && cExported != 'false') {
                    actions[t + ' ' + cName + ' is exported'] = true;
                  }
                  var filter = component['intent-filter'];
                  if (filter)
                    filter.forEach(function (f) {
                      if (f.action) {
                        f.action.forEach(function (a) {
                          actions[a['attributes']['android:name'] + ' received by: ' + cName] = true;
                        })
                      }
                    });
                })
              }
            })
          })
          var list = [];
          for (var a in actions) {
            list.push(a);
          }
          
          return list.map(function (item) { return {id: ++id, title: item }; })
        }

        $scope.apps = apps.sort().map(function (app) { 
          return {
            id: ++id, 
            title: app.app, 
            items: [ 
              { id: ++id, title: 'permissions', items: getPermissions(app) } ,
              { id: ++id, title: 'features-requested', items: getFeatures(app) } ,
              { id: ++id, title: 'intent-filters', items: getAllIntentFilters(app) }
            ] 
          }; 
        });
        //$scope.$apply();
      })
    }])
