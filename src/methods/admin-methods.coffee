_ = require 'underscore-ext'
async = require 'async'
Boom = require 'boom'
Hoek = require 'hoek'
mongoose = require "mongoose"
ObjectId = mongoose.Types.ObjectId


###
Provides methods to interact with scotties.
###
module.exports = class AdminMethods

  ###
  Initializes a new instance of the @see ScottyMethods class.
  @param {Object} models A collection of models that can be used.
  ###
  constructor:(@models, @users, @oauthApps, @oauthAuth,@oauthScopes) ->
    #Hoek.assert @models,i18n.assertModelsRequired
    #Hoek.assert @models.OauthScope,i18n.assertOauthScopeInModels

    throw new Error "models parameter is required" unless @models
    throw new Error "oauthApps parameter is required" unless @oauthApps
    throw new Error "oauthAuth parameter is required" unless @oauthAuth
    throw new Error "oauthScopes parameter is required" unless @oauthScopes

  ###
  Sets up an account ready for use.
  ###
  setup: (_tenantId,appName, username, email, password,scopes = [], clientId = null, secret = null,options = {}, cb = ->) =>
    return cb new Error "_tenantId parameter is required." unless _tenantId
    return cb new Error "appName parameter is required." unless appName
    return cb new Error "username parameter is required." unless username
    return cb new Error "email parameter is required." unless email
    return cb new Error "password parameter is required." unless password

    if _.isFunction(options)
      cb = options 
      options = {}

    _tenantId = new ObjectId _tenantId.toString()

    adminUser =
      _tenantId : _tenantId
      username : username
      password : password
      displayName: 'ADMIN'
      roles: ['admin','serveradmin']
      email : email

    # @TODO Check if user exists, if so, do nothing

    user =
      _id: "52998e1c32e5724771000009"


    appData =
      _tenantId : _tenantId
      name : appName
      clientId : clientId
      secret : secret
      createdByUserId : user._id


    _createScope = (scope,cb) =>
      @oauthScopes.create _tenantId,scope,null, cb

    async.map scopes, _createScope, (err,createdScopes) =>
      return cb err if err

      @oauthApps.create _tenantId,appData, {}, (err, app) =>
        return cb err if err

        clientId = app.clients[0].clientId
        return cb new Error "Failed to create app client" unless clientId

        @oauthAuth.createOrReuseTokenForUserId _tenantId, user._id, clientId, null, null, null, (err, token) =>
          return cb err if err
          return cb new Error "Failed to create token" unless token

          token =
            accessToken : token.accessToken
            refreshToken : token.refreshToken
          cb null, app, user, token,createdScopes || []

