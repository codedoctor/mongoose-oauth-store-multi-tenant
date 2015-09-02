_ = require 'underscore'
Boom = require 'boom'
Hoek = require 'hoek'
mongooseRestHelper = require 'mongoose-rest-helper'
i18n = require '../i18n'

###
Provides methods to interact with the scope store.
###
module.exports = class OauthScopeMethods
  UPDATE_EXCLUDEFIELDS = ['_id']

  constructor:(@models) ->
    Hoek.assert @models,i18n.assertModelsRequired
    Hoek.assert @models.OauthScope,i18n.assertOauthScopeInModels

  ###
  Returns all the scopes for a given _tenantId
  ###
  all: (_tenantId,options = {},cb) =>
    if _.isFunction(options)
      cb = options 
      options = {}
    Hoek.assert _.isFunction(cb),"The required parameter cb is missing or not a function."

    return cb Boom.badData( i18n.errorTenantIdRequired) unless _tenantId

    settings = 
        baseQuery:
          _tenantId : mongooseRestHelper.asObjectId _tenantId
        defaultSort: 'name'
        defaultSelect: null
        defaultCount: 1000
    mongooseRestHelper.all @models.OauthScope,settings,options, cb

  ###
  Get a scope for it's id.
  ###
  get: (oauthScopeId,options = {}, cb) =>
    if _.isFunction(options)
      cb = options 
      options = {}
    Hoek.assert _.isFunction(cb),"The required parameter cb is missing or not a function."

    return cb Boom.badData( i18n.errorOauthScopeIdRequired) unless oauthScopeId
    mongooseRestHelper.getById @models.OauthScope,oauthScopeId,null,options, cb


  ###
  Create a new OauthScope object
  ###
  create:(_tenantId,objs = {}, options = {}, cb) =>
    if _.isFunction(options)
      cb = options 
      options = {}
    Hoek.assert _.isFunction(cb),"The required parameter cb is missing or not a function."

    return cb Boom.badData( i18n.errorTenantIdRequired) unless _tenantId

    settings = {}
    objs._tenantId = mongooseRestHelper.asObjectId _tenantId
    mongooseRestHelper.create @models.OauthScope,settings,objs,options,cb

  ###
  Completely destroys an OauthScope object
  ###
  destroy: (oauthScopeId, options = {}, cb) =>
    if _.isFunction(options)
      cb = options 
      options = {}
    Hoek.assert _.isFunction(cb),"The required parameter cb is missing or not a function."

    return cb Boom.badData( i18n.errorOauthScopeIdRequired) unless oauthScopeId
    settings = {}
    mongooseRestHelper.destroy @models.OauthScope,oauthScopeId, settings,{}, cb

  ###
  Updates an OauthScope.
  ###
  patch: (oauthScopeId, obj = {}, options = {}, cb) =>
    if _.isFunction(options)
      cb = options 
      options = {}
    Hoek.assert _.isFunction(cb),"The required parameter cb is missing or not a function."

    return cb Boom.badData( i18n.errorOauthScopeIdRequired) unless oauthScopeId
    settings =
      exclude : UPDATE_EXCLUDEFIELDS
    mongooseRestHelper.patch @models.OauthScope,oauthScopeId, settings, obj, options, cb

