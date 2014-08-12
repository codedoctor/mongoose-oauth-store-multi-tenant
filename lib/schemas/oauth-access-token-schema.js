(function() {
  var OauthAccessTokenSchema, Schema, mongoose, passgen, pluginTimestamp;

  mongoose = require('mongoose');

  Schema = mongoose.Schema;

  passgen = require('passgen');

  pluginTimestamp = require("mongoose-plugins-timestamp");


  /*
  THe actual token. The token itself is the _id as a lowercase string
   */

  module.exports = OauthAccessTokenSchema = new mongoose.Schema({
    _tenantId: {
      type: mongoose.Schema.ObjectId,
      require: true
    },
    appId: {
      type: Schema.ObjectId
    },

    /*
    The identity to whom the token was issued. This can be any kind of string.
     */

    /*
    Use to discriminate between token request source realm. Leave blank for the API, but
    use it for the test tokens in the admin interface
     */
    realm: {
      type: String,
      "default": ''
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
      type: Schema.ObjectId,
      ref: 'User'
    },
    expiresAt: {
      type: Date,
      "default": null
    },
    scope: {
      type: [String],
      "default": function() {
        return [];
      }
    },
    refreshToken: {
      type: String,
      "default": function() {
        return passgen.create(80);
      }
    }
  }, {
    strict: true,
    collection: 'identitymt.oauthaccesstokens'
  });

  OauthAccessTokenSchema.plugin(pluginTimestamp.timestamps);

  OauthAccessTokenSchema.virtual('accessToken').get(function() {
    return "" + this._id;
  });


  /*
   * Created At
   * Updated At
   * Scope
   * expires_at
   * refresh_token
  token expires for good.
         attr_reader :expires_at
          * Timestamp if revoked.
         attr_accessor :revoked_at
          * Timestamp of last access using this token, rounded up to hour.
         attr_accessor :last_access
          * Timestamp of previous access using this token, rounded up to hour.
         attr_accessor :prev_access
   */

}).call(this);

//# sourceMappingURL=oauth-access-token-schema.js.map
