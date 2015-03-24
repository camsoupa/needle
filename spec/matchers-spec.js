var matchClass = require('../bin/matchers').matchClass,
    parse = require('sexpression').parse;

describe('matchClass', function () {
  it('should match an interface with no attached source', function () {
    var sexpr = parse(
       "(interface (attrs public abstract ) com/google/android/gms/games/multiplayer/realtime/RealTimeMessageReceivedListener" + 
       "    (super java/lang/Object)" + 
       "(method (attrs public abstract ) onRealTimeMessageReceived([object com/google/android/gms/games/multiplayer/realtime/RealTimeMessage] )void" + 
       ")\n" + 
       "\n" +
       ")")
    var clazz = matchClass(sexpr);
    expect(clazz).not.toBe(null);
  })
})
