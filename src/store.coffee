_ = require 'underscore'
mongoose = require 'mongoose'

OauthAccessGrantSchema = require './schemas/oauth-access-grant-schema'
OauthAccessTokenSchema = require './schemas/oauth-access-token-schema'
OauthAppSchema = require './schemas/oauth-app-schema'
OauthClientSchema = require './schemas/oauth-client-schema'
OauthRedirectUriSchema = require './schemas/oauth-redirect-uri-schema'
ScopeSchema = require './schemas/scope-schema'

AdminMethods = require './methods/admin-methods'
OauthAppMethods = require './methods/oauth-app-methods'
OauthAuthMethods = require './methods/oauth-auth-methods'
OauthScopeMethods = require './methods/oauth-scope-methods'

module.exports = class Store
  ###
  Initializes a new instance of the {Store}
  @param [Object] settings configuration options for this store
  @option settings [Function] initializeSchema optional function that is called with the schema before it is converted to a model.
  @option settings [Boolean] autoIndex defaults to true and updates the db indexes on load. Should be off for production.
  ###
  constructor: (@settings = {}) ->
    _.defaults @settings, 
                  autoIndex : true
                  initializeSchema: (schema) -> 

    @schemas = [
      OauthAccessGrantSchema
      OauthAccessTokenSchema
      OauthAppSchema
      OauthClientSchema
      OauthRedirectUriSchema
      ScopeSchema
    ]

    @settings.initializeSchema schema for schema in @schemas
    schema.set 'autoIndex', @settings.autoIndex for schema in @schemas

    m = mongoose
    m = @settings.connection if @settings.connection

    @models =
      OauthAccessGrant : m.model "OAuthAccessGrant", OauthAccessGrantSchema
      OauthAccessToken : m.model "OauthAccessToken", OauthAccessTokenSchema
      OauthApp : m.model "OauthApp", OauthAppSchema
      Scope: m.model "Scope",ScopeSchema
    
    @oauthAuth = new OauthAuthMethods @models
    @oauthScopes =  new OauthScopeMethods @models
    @oauthApps = new OauthAppMethods @models, @oauthScopes
    @admin = new AdminMethods @models, @users, @oauthApps, @oauthAuth,@oauthScopes

