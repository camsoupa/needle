angular.module('needle')
  .controller('CodeCtrl', ['$scope', '$rootScope', '$http', '$timeout', '$anchorScroll', '$location',
    function($scope, $rootScope, $http, $timeout, $anchorScroll, $location) {
      var filesCache = {};

      /* look backward from first stmt line for the method def by name */
      function getMethodDefLine(lines, methodDef) {
        var index = methodDef.startLine - 2;
        while (index >= 0 && lines[index].text.indexOf(' ' + methodDef.name) < 0) {
          --index;
        }
        return index;
      }

      function highlightAndScrollToLine (data, lineOrMethodDef) {
        var line = typeof lineOrMethodDef == 'number' 
          ? lineOrMethodDef : getMethodDefLine(data.lines, lineOrMethodDef);
        if (line >= 0) data.lines[line].highlight = true;
        $scope.file = data;
         $timeout(function () {
           $location.hash('line-' + Math.max(0, line-5)); 
           $anchorScroll();
         }, 20);
      }

      /* get the file from the server and scroll to the line */
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

      /* broadcast handlers */
      
      $scope.$on('risk_request', function (evt, risk, app) {
        showFile(app, risk.filename, risk.line-1);
      })
      $scope.$on('method_request', function (evt, method, app) {
        showFile(app, method.filename, method);
      })
      $scope.$on('callgraph_method_request', function (evt, method, app) {
        showFile(app, method.filename, method);
      })
    }])
