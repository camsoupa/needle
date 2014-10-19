angular.module('needle')
  .controller('code', ['$scope', '$rootScope', '$http', '$timeout', '$anchorScroll', '$location',
    function($scope, $rootScope, $http, $timeout, $anchorScroll, $location) {
      var filesCache = {};

      function getMethodDefLine(lines, methodDef) {
        var index = methodDef.startLine - 2;
        while (index >= 0 && lines[index].text.indexOf(' ' + methodDef.name) < 0) {
          --index;
        }
        return index;
      }

      function highlightAndScrollToLine (data, lineOrMethodDef) {
        var line = typeof lineOrMethodDef == 'number' ? lineOrMethodDef : getMethodDefLine(data.lines, lineOrMethodDef);
        if (line >= 0) data.lines[line].highlight = true;
        $scope.file = data;
         $timeout(function () {
           $location.hash('line-' + Math.max(0, line-5)); 
           $anchorScroll();
         }, 20);
      }

      function showFile (app, path, line) {
        if (path in filesCache) {
          highlightAndScrollToLine(filesCache[path], line);
        } else {
          $http.get('file', { params: { app: app, path: path }}).success(function (data) {
            filesCache[path] = data;
            highlightAndScrollToLine(data, line);
          });
        }
      }

      $scope.$on('risk_request', function (evt, item, app) {
        showFile(app, item.data.filename, item.data.line-1);
      })
      $scope.$on('method_request', function (evt, item, app) {
        showFile(app, item.data.filename, item.data);
      })
    }])
