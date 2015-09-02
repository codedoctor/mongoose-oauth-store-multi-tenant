_ = require 'underscore'
Boom = require 'boom'
Hoek = require 'hoek'
mongooseRestHelper = require 'mongoose-rest-helper'
i18n = require '../i18n'

###
Provides methods to interact with the auth store.
###
module.exports = class OauthAuthMethods

  TENYEARSINSECONDS =  60 * 60 * 24 * 365 * 10
  TENMINUTESINSECONDS = 60 * 10
  DEFAULT_EXPIRATION = 3600

  ###
  Initializes a new instance of the @see AuthMethods class.
  @param {Object} models A collection of models to be used within the auth framework.
  ###
  constructor:(@models) ->
    Hoek.assert @models,i18n.assertModelsRequired
    Hoek.assert @models.OauthApp,i18n.assertOauthAppInModels
    Hoek.assert @models.OauthAccessToken,i18n.assertOauthAccessTokenInModels
    Hoek.assert @models.OauthAccessGrant,i18n.assertOauthAccessGrantInModels

  ###
  Returns the current date + seconds
  @param {Number} seconds The seconds, or if null then roughly 10 years is assumed.
  ###
  currentDateAndSeconds:(seconds = TENYEARSINSECONDS) =>
    now = new Date()
    now.setSeconds(now.getSeconds() + seconds)
    now

  ###
  Retrieves an app for a key. This ONLY retrieves active keys
  @param {string} appKey the application key to retrieve the app for.
  ###
  appForClientId:(clientId,options = {}, cb) =>
    if _.isFunction(options)
      cb = options 
      options = {}
    Hoek.assert _.isFunction(cb),"The required parameter cb is missing or not a function."

    return cb Boom.badData( i18n.errorClientIdRequired) unless clientId

    @models.OauthApp.findOne 'clients.clientId' : clientId, (err, item) =>
      return cb err if err
      # TODO: Mutliple keys, check if revoked
      cb null, item

  ###
  Somehow validates a token. A valid token exists, has not been revoked yet,
  has an expiration higher than now.
  isClientValid can be checked for tighter security.
  ###
  validate: (token, clientId,options = {}, cb) =>
    if _.isFunction(options)
      cb = options 
      options = {}
    Hoek.assert _.isFunction(cb),"The required parameter cb is missing or not a function."
    return cb Boom.badData( i18n.errorTokenRequired) unless token
    return cb Boom.badData( i18n.errorClientIdRequired) unless clientId


    @models.OauthAccessToken.findOne _id : token, (err, item) =>
      return cb err  if err
      return cb null, isValid : false unless item

      cb null,
        isValid : !item.revoked
        isClientValid: true #!!(clientId.toString() is item.client_id.toString())
        actor:
          actorId: item.identityUserId # make sure this is the id
        clientId : clientId # item.client_id.toString()
        scopes : item.scope || []
        expiresIn : 10000 #expires_at - calculate seconds till expiration

  ###
  Creates a new access grant.
  @param {String || ObjectId} oauthAppId the mongoose app id.
  @param {String || ObjectId} userId the mongoose user id
  @param {String} redirectUrl the requested redirect_uri. This must be later matched when issuing an access token.
  @param {String[]} scope an array of strings, with one or more elements, specifying the scope that should be granted.
  @param {String} realm an optional realm for which this access grant is for.
  @param {Callback} cb the callback that will be invoked, with err and the mongoose AccessGrant model.
  ###
  createAccessGrant: (_tenantId,oauthAppId, userId, redirectUrl, scope, realm = null, options = {}, cb) =>
    if _.isFunction(options)
      cb = options 
      options = {}
    Hoek.assert _.isFunction(cb),"The required parameter cb is missing or not a function."

    scope = [scope] if _.isString(scope)

    return cb Boom.badData( i18n.errorTenantIdRequired) unless _tenantId
    return cb Boom.badData( i18n.errorOauthAppIdRequired) unless oauthAppId
    return cb Boom.badData( i18n.errorUserIdRequired) unless userId
    return cb Boom.badData( i18n.errorRedirectUrlRequired) unless redirectUrl
    return cb Boom.badData( i18n.errorScopeRequiredAndArrayAndMinOne) unless scope && _.isArray(scope) && scope.length > 0

    accessGrant = new @models.OauthAccessGrant
      _tenantId : _tenantId
      appId : oauthAppId
      identityUserId: userId
      realm : realm
      redirectUrl : redirectUrl
      scope : scope
      expiresAt : @currentDateAndSeconds(TENMINUTESINSECONDS)

    accessGrant.save (err) =>
      return cb err if err
      cb null, accessGrant

  ###
  Creates a token for a user/app/realm
  ###
  createOrReuseTokenForUserId: (_tenantId,userId, clientId, realm, scope , expiresIn,options = {}, cb) =>
    if _.isFunction(options)
      cb = options 
      options = {}
    Hoek.assert _.isFunction(cb),"The required parameter cb is missing or not a function."


    scope = [scope] if _.isString scope

    return cb Boom.badData( i18n.errorTenantIdRequired) unless _tenantId
    return cb Boom.badData( i18n.errorUserIdRequired) unless userId
    return cb Boom.badData( i18n.errorClientIdRequired) unless clientId

    userId = mongooseRestHelper.asObjectId userId

    @appForClientId clientId, (err, app) =>
      return cb err if err
      return cb Boom.badRequest("Could not find app for clientId #{clientId}") unless app

      @models.OauthAccessToken.findOne {_tenantId : _tenantId, appId: app._id, identityUserId: userId}, (err,token) =>
        return cb err if err
        return cb null, token if token

        @createTokenForUserId _tenantId,userId, clientId, realm, scope, expiresIn,options, cb


  ###
  Creates a token for a user/app/realm
  ###
  createTokenForUserId: (_tenantId, userId, clientId, realm =  null, scope = null, expiresIn = null, options = {}, cb) =>
    if _.isFunction(options)
      cb = options 
      options = {}
    Hoek.assert _.isFunction(cb),"The required parameter cb is missing or not a function."


    scope = [scope] if _.isString scope

    return cb Boom.badData( i18n.errorTenantIdRequired) unless _tenantId
    return cb Boom.badData( i18n.errorUserIdRequired) unless userId
    return cb Boom.badData( i18n.errorClientIdRequired) unless clientId

    @appForClientId clientId, (err, app) =>
      return cb err if err
      return cb Boom.notFound("#{i18n.prefixErrorNoAppForClientId} #{clientId}") unless app

      token = new @models.OauthAccessToken
        _tenantId : _tenantId
        appId: app._id
        identityUserId: userId
        realm: realm
        expiresAt: @currentDateAndSeconds(expiresIn || DEFAULT_EXPIRATION) # WRONG OR
        scope: if scope && _.isArray(scope) && scope.length > 0 then scope else app.scopes

      token.save (err) =>
          return cb err if err
          cb null, token

  ###
  Takes a code and exchanges it for an access token
  @param {String} code the authorization_code to exchange into an access token
  ###
  exchangeAuthorizationCodeForAccessToken: (code,options = {}, cb) =>
    if _.isFunction(options)
      cb = options 
      options = {}
    Hoek.assert _.isFunction(cb),"The required parameter cb is missing or not a function."

    return cb Boom.badData( i18n.errorCodeRequired) unless refreshToken


    @models.OauthAccessGrant.findOne _id: code, (err, accessGrant) =>
      return cb err if err
      return cb Boom.notFound(i18n.accessGrantNotFound) unless accessGrant

      # TODO: CHECK VALIDITY

      token = new @models.OauthAccessToken
        appId: accessGrant.appId
        identityUserId: accessGrant.userId
        realm: accessGrant.realm
        expiresAt: @currentDateAndSeconds(DEFAULT_EXPIRATION) 
        scope: accessGrant.scope

      token.save (err) =>
          return cb err if err

          accessGrant.revokedAt =  new Date()
          accessGrant.accessToken = token._id
          accessGrant.save (err) =>
            return cb err if err

            cb null, token

  ###
  Takes a code and exchanges it for an access token
  @param {String} refreshToken the refresh_token to exchange into an access token
  ###
  exchangeRefreshTokenForAccessToken: (refreshToken, options = {}, cb) =>
    if _.isFunction(options)
      cb = options 
      options = {}
    Hoek.assert _.isFunction(cb),"The required parameter cb is missing or not a function."

    return cb Boom.badData( i18n.errorRefreshTokenRequired) unless refreshToken


    @models.OauthAccessToken.findOne refreshToken: refreshToken, (err, token) =>
      return cb err if err
      return cb Boom.notFound(i18n.tokenNotFound) unless token

      token.refreshToken = null
      # MAKE SURE THIS TOKEN IS EXPIRED

      token.save (err) =>
        return cb err if err

        newToken = new @models.OauthAccessToken
          _tenantId : token._tenantId
          appId: token.appId
          identityUserId: token.userId
          realm: token.realm
          expiresAt: @currentDateAndSeconds(DEFAULT_EXPIRATION) 
          scope: token.scope

        newToken.save (err) =>
          return cb err if err
          cb null, newToken

