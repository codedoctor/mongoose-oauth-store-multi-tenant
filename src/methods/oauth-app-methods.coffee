_ = require 'underscore'
Boom = require 'boom'
Hoek = require 'hoek'
mongooseRestHelper = require 'mongoose-rest-helper'
i18n = require '../i18n'
passgen = require 'passgen'

fnUnprocessableEntity = (message = "",data) ->
  return Boom.create 422, message, data

module.exports = class OauthAppMethods
  KEY_LENGTH = 20
  SECRET_LENGTH = 40
  UPDATE_EXCLUDEFIELDS = ['_id','createdAt']

  constructor:(@models, @oauthScopeMethods) ->
    Hoek.assert @models,i18n.assertModelsRequired
    Hoek.assert @models.OauthScope,i18n.assertOauthScopeInModels
    Hoek.assert @models.OauthApp,i18n.assertOauthAppInModels
    Hoek.assert @models.OauthApp,i18n.assertOauthAppInModels
    Hoek.assert @oauthScopeMethods,i18n.assertOauthScopeMethods

  ###
  Create a new oauth client.
  ###
  create:(_tenantId,objs = {},options={}, cb = ->) =>
    return cb fnUnprocessableEntity( i18n.errorTenantIdRequired) unless _tenantId

    if _.isFunction(options)
      cb = options 
      options = {}

    objs._tenantId = mongooseRestHelper.asObjectId _tenantId

    @models.OauthScope.find _tenantId : objs._tenantId, (err, scopes) =>
      return cb err if err

      scopes = _.reject scopes || [], (x) -> x.isInternal
  
      optionalClientId = objs.clientId
      optionalSecret = objs.secret

      unless objs.scopes and objs.scopes.length > 0
        objs.scopes = _.pluck(scopes || [], "name")
  
      model = new @models.OauthApp objs

      if objs.callbackUrl
        model.redirectUrls.push uri: objs.callbackUrl
        #model.redirectUrls.push new @models.OauthRedirectUri(uri: objs.callbackUrl)

      #oAuthClient = new @models.OauthClient()
      oAuthClient = {}
      oAuthClient.clientId = optionalClientId if optionalClientId
      oAuthClient.secret = optionalSecret if optionalSecret

      model.clients = [ oAuthClient ]
      model.save (err) =>
        return cb err if err
        cb null, model


  ###
  Retrieves all oauth apps for a specific _tenantId
  ###
  all:(_tenantId,options = {}, cb = ->) =>
    return cb fnUnprocessableEntity( i18n.errorTenantIdRequired) unless _tenantId

    settings = 
        baseQuery:
          _tenantId : mongooseRestHelper.asObjectId _tenantId
        defaultSort: 'name'
        defaultSelect: null
        defaultCount: 20

    mongooseRestHelper.all @models.OauthApp,settings,options, cb

  ###
  Retrieves apps for a specific user, within the _tenantId scope.
  ###
  getAppsForUser:(_tenantId,owningUserId, options = {}, cb = ->) =>
    return cb fnUnprocessableEntity( i18n.errorTenantIdRequired) unless _tenantId
    return cb fnUnprocessableEntity( i18n.errorOwningUserIdRequired) unless owningUserId

    if _.isFunction(options)
      cb = options 
      options = {}

    options.where ||= {}
    options.where.createdByUserId = mongooseRestHelper.asObjectId owningUserId

    @all _tenantId,options,cb

  ###
  returns a specific oauth app.
  ###
  get: (oauthAppId,options={}, cb = ->) =>
    return cb fnUnprocessableEntity( i18n.errorOauthAppIdRequired) unless oauthAppId
    mongooseRestHelper.getById @models.OauthApp,oauthAppId,null,options, cb

  ###
  Completely destroys an oauth app.
  ###
  destroy: (oauthAppId,options = {}, cb = ->) =>
    return cb fnUnprocessableEntity( i18n.errorOauthAppIdRequired) unless oauthAppId
    settings = {}
    mongooseRestHelper.destroy @models.OauthApp,oauthAppId, settings,{}, cb

  ###
  Reset the app keys for an oauth app.
  ###
  resetAppKeys: (oauthAppId,options = {}, cb = ->) =>
    return cb fnUnprocessableEntity( i18n.errorOauthAppIdRequired) unless oauthAppId

    if _.isFunction(options)
      cb = options 
      options = {}

    oauthAppId = mongooseRestHelper.asObjectId oauthAppId
    @models.OauthApp.findOne _id : oauthAppId, (err, item) =>
      return cb err if err

      item.clients[0].clientId = passgen.create(KEY_LENGTH)
      item.clients[0].secret = passgen.create(SECRET_LENGTH)

      item.save (err) =>
        return cb err if err
        cb null, item

  ###
  Update an app.
  ###
  patch: (oauthAppId, obj = {},options = {}, cb = ->) =>
    return cb fnUnprocessableEntity( i18n.errorOauthAppIdRequired) unless oauthAppId

    settings =
      exclude : UPDATE_EXCLUDEFIELDS
    mongooseRestHelper.patch @models.OauthApp,oauthAppId, settings, obj, options, cb

