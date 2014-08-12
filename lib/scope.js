(function() {
  var _,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  _ = require('underscore');

  exports.Scope = (function() {
    function Scope(definition) {
      if (definition == null) {
        definition = {};
      }
      this.isValid = __bind(this.isValid, this);
      _.extend(this, definition);
    }

    Scope.prototype.isValid = function() {
      return this.name && this.name.length > 0;
    };

    return Scope;

  })();

}).call(this);

//# sourceMappingURL=scope.js.map
