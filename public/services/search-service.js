angular.module('needle')
  .factory('search', ['socket',
    function(socket) {
      return { 
        search: function (query, onData) {
          socket.emit('search', query);
          socket.on('search_results', onData) 
        }
      }
    }])
