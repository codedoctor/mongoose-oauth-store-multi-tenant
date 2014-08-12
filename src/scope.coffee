_ = require 'underscore'

class exports.Scope
  constructor: (definition = {}) ->
    _.extend @, definition

  isValid: () =>
    @name && @name.length > 0

