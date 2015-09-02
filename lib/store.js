(function() {
  var OauthAccessGrantSchema, OauthAccessTokenSchema, OauthAppMethods, OauthAppSchema, OauthAuthMethods, OauthClientSchema, OauthRedirectUriSchema, OauthScopeMethods, OauthScopeSchema, Store, _, mongoose;

  _ = require('underscore');

  mongoose = require('mongoose');

  OauthAccessGrantSchema = require('./schemas/oauth-access-grant-schema');

  OauthAccessTokenSchema = require('./schemas/oauth-access-token-schema');

  OauthAppSchema = require('./schemas/oauth-app-schema');

  OauthClientSchema = require('./schemas/oauth-client-schema');

  OauthRedirectUriSchema = require('./schemas/oauth-redirect-uri-schema');

  OauthScopeSchema = require('./schemas/oauth-scope-schema');

  OauthAppMethods = require('./methods/oauth-app-methods');

  OauthAuthMethods = require('./methods/oauth-auth-methods');

  OauthScopeMethods = require('./methods/oauth-scope-methods');

  module.exports = Store = (function() {

    /*
    Initializes a new instance of the {Store}
    @param [Object] settings configuration options for this store
    @option settings [Function] initializeSchema optional function that is called with the schema before it is converted to a model.
    @option settings [Boolean] autoIndex defaults to true and updates the db indexes on load. Should be off for production.
     */
    function Store(settings) {
      var i, j, len, len1, m, ref, ref1, schema;
      this.settings = settings != null ? settings : {};
      _.defaults(this.settings, {
        autoIndex: true,
        initializeSchema: function(schema) {}
      });
      this.schemas = [OauthAccessGrantSchema, OauthAccessTokenSchema, OauthAppSchema, OauthClientSchema, OauthRedirectUriSchema, OauthScopeSchema];
      ref = this.schemas;
      for (i = 0, len = ref.length; i < len; i++) {
        schema = ref[i];
        this.settings.initializeSchema(schema);
      }
      ref1 = this.schemas;
      for (j = 0, len1 = ref1.length; j < len1; j++) {
        schema = ref1[j];
        schema.set('autoIndex', this.settings.autoIndex);
      }
      m = mongoose;
      if (this.settings.connection) {
        m = this.settings.connection;
      }
      this.models = {
        OauthAccessGrant: m.model("OAuthAccessGrant", OauthAccessGrantSchema),
        OauthAccessToken: m.model("OauthAccessToken", OauthAccessTokenSchema),
        OauthApp: m.model("OauthApp", OauthAppSchema),
        OauthScope: m.model("OauthScope", OauthScopeSchema)
      };
      this.oauthAuth = new OauthAuthMethods(this.models);
      this.oauthScopes = new OauthScopeMethods(this.models);
      this.oauthApps = new OauthAppMethods(this.models, this.oauthScopes);
    }

    return Store;

  })();

}).call(this);

//# sourceMappingURL=store.js.map
