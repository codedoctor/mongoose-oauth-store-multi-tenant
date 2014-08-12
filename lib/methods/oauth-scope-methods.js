(function() {
  var Boom, Hoek, OauthScopeMethods, ObjectId, Scope, mongoose, mongooseRestHelper, _,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  _ = require('underscore-ext');

  Boom = require('boom');

  Hoek = require('hoek');

  mongoose = require("mongoose");

  mongooseRestHelper = require('mongoose-rest-helper');

  ObjectId = mongoose.Types.ObjectId;

  Scope = require('../scope').Scope;


  /*
  Provides methods to interact with the scope store.
   */

  module.exports = OauthScopeMethods = (function() {
    var UPDATE_EXCLUDEFIELDS;

    UPDATE_EXCLUDEFIELDS = ['_id'];


    /*
    A hash of scopes.
     */


    /*
    Initializes a new instance of the @see ScopeMethods class.
    @param {Object} models A collection of models to be used within the auth framework.
    @description
    The config object looks like this:
    ...
    scopes: [...]
    ...
     */


    /*
    constructor:(@models, config) ->
      if config && config.scopes
        for scopeDefinition in config.scopes
          scope = new Scope(scopeDefinition)
    
          if scope.isValid()
            @loadedScopes[scope.name] = scope
          else
            console.log "Invalid scope in config - skipped - #{JSON.stringify(scopeDefinition)}"
             * Todo: Better logging, error handling
     */

    function OauthScopeMethods(models) {
      this.models = models;
      this.patch = __bind(this.patch, this);
      this.destroy = __bind(this.destroy, this);
      this.create = __bind(this.create, this);
      this.get = __bind(this.get, this);
      this.all = __bind(this.all, this);
    }


    /*
    Returns all the scopes for an account
     */

    OauthScopeMethods.prototype.all = function(_tenantId, options, cb) {
      var settings;
      if (options == null) {
        options = {};
      }
      if (cb == null) {
        cb = function() {};
      }
      if (!_tenantId) {
        return cb(new Error("_tenantId parameter is required."));
      }
      settings = {
        baseQuery: {
          _tenantId: mongooseRestHelper.asObjectId(_tenantId)
        },
        defaultSort: 'name',
        defaultSelect: null,
        defaultCount: 1000
      };
      return mongooseRestHelper.all(this.models.OauthScope, settings, options, cb);
    };


    /*
    Get a scope for it's id.
     */

    OauthScopeMethods.prototype.get = function(scopeId, options, cb) {
      if (options == null) {
        options = {};
      }
      if (cb == null) {
        cb = function() {};
      }
      if (!scopeId) {
        return cb(new Error("scopeId parameter is required."));
      }
      return mongooseRestHelper.getById(this.models.OauthScope, scopeId, null, options, cb);
    };


    /*
    Create a new processDefinition
     */

    OauthScopeMethods.prototype.create = function(_tenantId, objs, options, cb) {
      var settings;
      if (objs == null) {
        objs = {};
      }
      if (options == null) {
        options = {};
      }
      if (cb == null) {
        cb = function() {};
      }
      if (!_tenantId) {
        return cb(new Error("_tenantId parameter is required."));
      }
      settings = {};
      objs._tenantId = new ObjectId(_tenantId.toString());
      return mongooseRestHelper.create(this.models.OauthScope, settings, objs, options, cb);
    };


    /*
    Completely destroys an organization.
     */

    OauthScopeMethods.prototype.destroy = function(scopeId, options, cb) {
      var settings;
      if (options == null) {
        options = {};
      }
      if (cb == null) {
        cb = function() {};
      }
      if (!scopeId) {
        return cb(new Error("scopeId parameter is required."));
      }
      settings = {};
      return mongooseRestHelper.destroy(this.models.OauthScope, scopeId, settings, {}, cb);
    };


    /*
    Updates a deployment
     */

    OauthScopeMethods.prototype.patch = function(scopeId, obj, options, cb) {
      var settings;
      if (obj == null) {
        obj = {};
      }
      if (options == null) {
        options = {};
      }
      if (cb == null) {
        cb = function() {};
      }
      if (!scopeId) {
        return cb(new Error("scopeId parameter is required."));
      }
      settings = {
        exclude: UPDATE_EXCLUDEFIELDS
      };
      return mongooseRestHelper.patch(this.models.OauthScope, scopeId, settings, obj, options, cb);
    };

    return OauthScopeMethods;

  })();

}).call(this);

//# sourceMappingURL=oauth-scope-methods.js.map
