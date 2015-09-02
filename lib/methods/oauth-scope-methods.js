(function() {
  var Boom, Hoek, OauthScopeMethods, _, i18n, mongooseRestHelper,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  _ = require('underscore');

  Boom = require('boom');

  Hoek = require('hoek');

  mongooseRestHelper = require('mongoose-rest-helper');

  i18n = require('../i18n');


  /*
  Provides methods to interact with the scope store.
   */

  module.exports = OauthScopeMethods = (function() {
    var UPDATE_EXCLUDEFIELDS;

    UPDATE_EXCLUDEFIELDS = ['_id'];

    function OauthScopeMethods(models) {
      this.models = models;
      this.patch = bind(this.patch, this);
      this.destroy = bind(this.destroy, this);
      this.create = bind(this.create, this);
      this.get = bind(this.get, this);
      this.all = bind(this.all, this);
      Hoek.assert(this.models, i18n.assertModelsRequired);
      Hoek.assert(this.models.OauthScope, i18n.assertOauthScopeInModels);
    }


    /*
    Returns all the scopes for a given _tenantId
     */

    OauthScopeMethods.prototype.all = function(_tenantId, options, cb) {
      var settings;
      if (options == null) {
        options = {};
      }
      if (_.isFunction(options)) {
        cb = options;
        options = {};
      }
      Hoek.assert(_.isFunction(cb), "The required parameter cb is missing or not a function.");
      if (!_tenantId) {
        return cb(Boom.badData(i18n.errorTenantIdRequired));
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

    OauthScopeMethods.prototype.get = function(oauthScopeId, options, cb) {
      if (options == null) {
        options = {};
      }
      if (_.isFunction(options)) {
        cb = options;
        options = {};
      }
      Hoek.assert(_.isFunction(cb), "The required parameter cb is missing or not a function.");
      if (!oauthScopeId) {
        return cb(Boom.badData(i18n.errorOauthScopeIdRequired));
      }
      return mongooseRestHelper.getById(this.models.OauthScope, oauthScopeId, null, options, cb);
    };


    /*
    Create a new OauthScope object
     */

    OauthScopeMethods.prototype.create = function(_tenantId, objs, options, cb) {
      var settings;
      if (objs == null) {
        objs = {};
      }
      if (options == null) {
        options = {};
      }
      if (_.isFunction(options)) {
        cb = options;
        options = {};
      }
      Hoek.assert(_.isFunction(cb), "The required parameter cb is missing or not a function.");
      if (!_tenantId) {
        return cb(Boom.badData(i18n.errorTenantIdRequired));
      }
      settings = {};
      objs._tenantId = mongooseRestHelper.asObjectId(_tenantId);
      return mongooseRestHelper.create(this.models.OauthScope, settings, objs, options, cb);
    };


    /*
    Completely destroys an OauthScope object
     */

    OauthScopeMethods.prototype.destroy = function(oauthScopeId, options, cb) {
      var settings;
      if (options == null) {
        options = {};
      }
      if (_.isFunction(options)) {
        cb = options;
        options = {};
      }
      Hoek.assert(_.isFunction(cb), "The required parameter cb is missing or not a function.");
      if (!oauthScopeId) {
        return cb(Boom.badData(i18n.errorOauthScopeIdRequired));
      }
      settings = {};
      return mongooseRestHelper.destroy(this.models.OauthScope, oauthScopeId, settings, {}, cb);
    };


    /*
    Updates an OauthScope.
     */

    OauthScopeMethods.prototype.patch = function(oauthScopeId, obj, options, cb) {
      var settings;
      if (obj == null) {
        obj = {};
      }
      if (options == null) {
        options = {};
      }
      if (_.isFunction(options)) {
        cb = options;
        options = {};
      }
      Hoek.assert(_.isFunction(cb), "The required parameter cb is missing or not a function.");
      if (!oauthScopeId) {
        return cb(Boom.badData(i18n.errorOauthScopeIdRequired));
      }
      settings = {
        exclude: UPDATE_EXCLUDEFIELDS
      };
      return mongooseRestHelper.patch(this.models.OauthScope, oauthScopeId, settings, obj, options, cb);
    };

    return OauthScopeMethods;

  })();

}).call(this);

//# sourceMappingURL=oauth-scope-methods.js.map
