angular.module('needle')
  .factory('TaintPaths', function () { 
     return {
        get: function () {
          return [
            [
              { 
                file: 'com/pkg/SomeFile.java',
                line: 30,
                method: 'com/google/location/gps getLocation',
                category: 'GPS'
              },
              {
                file: 'com/pkg/AnotherFile.java',
                line: 30
              },
              { 
                file: 'com/pkg/LeakFile.java',
                line: 30,
                method: 'com/net/http post',
                category: 'NET'
              }
            ],
            [
              { 
                file: 'com/pkg/SomeFile.java',
                line: 5,
                method: 'com/google/FileReader read',
                category: 'FILE'
              },
              {
                file: 'com/pkg/YetAnotherFile.java',
                line: 12
              },
              {
                file: 'com/pkg/StillAnotherFile.java',
                line: 100
              },
              { 
                file: 'com/pkg/LeakFile.java',
                line: 30,
                method: 'com/net/http post',
                category: 'NET'
              }
            ]
          ];
        }
     }
  })
