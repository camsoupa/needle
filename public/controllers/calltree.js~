var myapp = angular.module('needle')
  .controller('calltree', [ '$scope', '$rootScope',
    function($scope, $rootScope) {
    // TODO make filterable with: https://github.com/ee/angular-ui-tree-filter
    $scope.pattern = '';
    $scope.toggle = function (scope) { scope.toggle(); }
    $scope.onRiskClicked = function (item) { 
      console.log(item.title);
      $rootScope.$broadcast('risk_request', item);
    }
    $scope.onMethodClicked = function (item) { 
      console.log(item.title);
      $rootScope.$broadcast('method_request', item);
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
    $scope.pkgs = [
      {
        "id": 1,
        "title": "pkg1",
        "items": [
          {
            "id": 11,
            "title": "node1.1",
            "items": [
              {
                "id": 111,
                "title": "node1.1.1",
                "items": [
                  {
                    "id": 111,
                    "title": "risk",
                    "filename" : "org.memotis.Crypto",
                    "line" : 1
                  }
                ]
              }
            ]
          },
          {
            "id": 12,
            "title": "node1.2",
            "items": []
          }
        ]
      },
      {
        "id": 2,
        "title": "pkg2",
        "items": [
          {
            "id": 21,
            "title": "node2.1",
            "items": []
          },
          {
            "id": 22,
            "title": "node2.2",
            "items": []
          }
        ]
      },
      {
        "id": 3,
        "title": "node3",
        "items": [
          {
            "id": 31,
            "title": "node3.1",
            "items": []
          }
        ]
      },
      {
        "id": 4,
        "title": "node4",
        "items": [
          {
            "id": 41,
            "title": "node4.1",
            "items": []
          }
        ]
      }
    ]
   }])
