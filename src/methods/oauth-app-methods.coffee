_ = require 'underscore-ext'
errors = require 'some-errors'
PageResult = require('simple-paginator').PageResult
mongoose = require "mongoose"
ObjectId = mongoose.Types.ObjectId
mongooseRestHelper = require 'mongoose-rest-helper'

module.exports = class OauthAppMethods
  KEY_LENGTH = 20
  SECRET_LENGTH = 40
  UPDATE_EXCLUDEFIELDS = ['_id','createdAt']

  constructor:(@models, @scopeMethods) ->
    throw new Error("models parameter is required") unless @models
    throw new Error("scopeMethods parameter is required") unless @scopeMethods

  ###
  Create a new oauth client.
  ###
  create:(_tenantId,objs = {},options={}, cb = ->) =>
    return cb new Error "_tenantId parameter is required." unless _tenantId

    if _.isFunction(options)
      cb = options 
      options = {}

    objs._tenantId = new ObjectId _tenantId.toString()

    @models.Scope.find _tenantId : objs._tenantId, (err, scopes) =>
      return cb err if err
  
      optionalClientId = objs.clientId
      optionalSecret = objs.secret

      objs.scopes = _.pluck(scopes || [], "name")
      model = new @models.OauthApp objs

      if objs.callbackUrl
        model.redirectUrls.push uri: objs.callbackUrl
        #model.redirectUrls.push new @models.OauthRedirectUri(uri: objs.callbackUrl)

      #oAuthClient = new @models.OauthClient()
      oAuthClient = {}
      oAuthClient.clientId = optionalClientId if optionalClientId
      oAuthClient.secret = optionalSecret if optionalSecret

      model.clients.push oAuthClient
      model.save (err) =>
        return cb err if err
        cb null, model


  ###
  Retrieves all oauth apps for a specific _tenantId
  ###
  all:(_tenantId,options = {}, cb = ->) =>
    return cb new Error "_tenantId parameter is required." unless _tenantId

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
    return cb new Error "_tenantId parameter is required." unless _tenantId
    return cb new Error "owningUserId parameter is required." unless owningUserId

    if _.isFunction(options)
      cb = options 
      options = {}

    options.where ||= {}
    options.where.createdByUserId = new ObjectId owningUserId.toString()

    @all _tenantId,options,cb

  ###
  returns a specific oauth app.
  ###
  get: (oauthAppId,options={}, cb = ->) =>
    return cb new Error "oauthAppId parameter is required." unless oauthAppId
    mongooseRestHelper.getById @models.OauthApp,oauthAppId,null,options, cb

  ###
  Completely destroys an app.
  ###
  destroy: (oauthAppId,options = {}, cb = ->) =>
    return cb new Error "oauthAppId parameter is required." unless oauthAppId
    settings = {}
    mongooseRestHelper.destroy @models.OauthApp,oauthAppId, settings,{}, cb

  ###
  Reset the app keys for an app.
  ###
  resetAppKeys: (oauthAppId,options = {}, cb = ->) =>
    return cb new Error "oauthAppId parameter is required." unless oauthAppId

    if _.isFunction(options)
      cb = options 
      options = {}

    oauthAppId = new ObjectId oauthAppId.toString()
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
    return cb new Error "oauthAppId parameter is required." unless oauthAppId

    settings =
      exclude : UPDATE_EXCLUDEFIELDS
    mongooseRestHelper.patch @models.OauthApp,oauthAppId, settings, obj, options, cb

