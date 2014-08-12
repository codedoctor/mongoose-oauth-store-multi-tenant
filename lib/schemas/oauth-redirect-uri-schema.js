(function() {
  var OauthRedirectUriSchema, mongoose;

  mongoose = require('mongoose');

  module.exports = OauthRedirectUriSchema = new mongoose.Schema({
    uri: {
      type: String
    }
  }, {
    strict: true
  });

}).call(this);

//# sourceMappingURL=oauth-redirect-uri-schema.js.map
