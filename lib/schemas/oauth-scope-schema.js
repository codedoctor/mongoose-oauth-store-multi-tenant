(function() {
  var OauthScopeSchema, mongoose;

  mongoose = require('mongoose');

  module.exports = OauthScopeSchema = new mongoose.Schema({
    _tenantId: {
      type: mongoose.Schema.ObjectId,
      require: true
    },
    name: {
      type: String
    },
    description: {
      type: String,
      "default": ''
    },
    developerDescription: {
      type: String,
      "default": ''
    },
    roles: {
      type: [String],
      "default": function() {
        return [];
      }
    }
  }, {
    strict: true,
    collection: 'identitymt.oauthscopes'
  });

  OauthScopeSchema.index({
    _tenantId: 1,
    name: 1
  }, {
    unique: true,
    sparse: false
  });

}).call(this);

//# sourceMappingURL=oauth-scope-schema.js.map
