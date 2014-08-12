_ = require 'underscore-ext'
Boom = require 'boom'
Hoek = require 'hoek'
mongoose = require "mongoose"
mongooseRestHelper = require 'mongoose-rest-helper'
ObjectId = mongoose.Types.ObjectId

Scope = require('../scope').Scope


###
Provides methods to interact with the scope store.
###
module.exports = class OauthScopeMethods
  UPDATE_EXCLUDEFIELDS = ['_id']


  ###
  A hash of scopes.
  ###
  #loadedScopes : {}

  ###
  Initializes a new instance of the @see ScopeMethods class.
  @param {Object} models A collection of models to be used within the auth framework.
  @description
  The config object looks like this:
  ...
  scopes: [...]
  ...
  ###
  ###
  constructor:(@models, config) ->
    if config && config.scopes
      for scopeDefinition in config.scopes
        scope = new Scope(scopeDefinition)

        if scope.isValid()
          @loadedScopes[scope.name] = scope
        else
          console.log "Invalid scope in config - skipped - #{JSON.stringify(scopeDefinition)}"
          # Todo: Better logging, error handling
  ###

  constructor:(@models) ->


  ###
  Returns all the scopes for an account
  ###
  all: (_tenantId,options = {},cb = ->) =>
    return cb new Error "_tenantId parameter is required." unless _tenantId

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
  get: (scopeId,options = {}, cb = ->) =>
    return cb new Error "scopeId parameter is required." unless scopeId
    mongooseRestHelper.getById @models.OauthScope,scopeId,null,options, cb


  ###
  Create a new processDefinition
  ###
  create:(_tenantId,objs = {}, options = {}, cb = ->) =>
    return cb new Error "_tenantId parameter is required." unless _tenantId
    settings = {}
    objs._tenantId = new ObjectId _tenantId.toString()
    mongooseRestHelper.create @models.OauthScope,settings,objs,options,cb

  ###
  Completely destroys an organization.
  ###
  destroy: (scopeId, options = {}, cb = ->) =>
    return cb new Error "scopeId parameter is required." unless scopeId
    settings = {}
    mongooseRestHelper.destroy @models.OauthScope,scopeId, settings,{}, cb


  ###
  Updates a deployment
  ###
  patch: (scopeId, obj = {}, options = {}, cb = ->) =>
    return cb new Error "scopeId parameter is required." unless scopeId
    settings =
      exclude : UPDATE_EXCLUDEFIELDS
    mongooseRestHelper.patch @models.OauthScope,scopeId, settings, obj, options, cb


