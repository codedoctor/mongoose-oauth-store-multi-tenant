(function() {
  var OauthAccessGrantSchema, mongoose;

  mongoose = require('mongoose');


  /*
  A single, one time usable, access grant.
   */

  module.exports = OauthAccessGrantSchema = new mongoose.Schema({
    _tenantId: {
      type: mongoose.Schema.ObjectId,
      require: true
    },
    appId: {
      type: mongoose.Schema.ObjectId
    },
    realm: {
      type: String
    },

    /*
    The type of identity. This is for future use.
     */
    identityType: {
      type: String,
      "default": "user"
    },

    /*
    The user id of the entity this was issued to, if available.
     */
    identityUserId: {
      type: mongoose.Schema.ObjectId
    },
    redirectUrl: {
      type: String
    },
    scope: {
      type: [String],
      "default": function() {
        return [];
      }
    },
    createdAt: {
      type: Date,
      "default": function() {
        return new Date();
      }
    },
    grantedAt: {
      type: Date,
      "default": function() {
        return new Date();
      }
    },
    expiresAt: {
      type: Date,
      "default": null
    },
    revokedAt: {
      type: Date,
      "default": null
    },
    accessTokenId: {
      type: mongoose.Schema.ObjectId,
      "default": null
    }
  }, {
    strict: true
  });

  ({
    collection: 'identitymt.oauthaccessgrants'
  });

}).call(this);

//# sourceMappingURL=oauth-access-grant-schema.js.map
