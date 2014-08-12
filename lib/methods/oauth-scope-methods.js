(function() {
  var Hoek, OauthScopeMethods, i18n, mongooseRestHelper, _,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  _ = require('underscore-ext');

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
      this.patch = __bind(this.patch, this);
      this.destroy = __bind(this.destroy, this);
      this.create = __bind(this.create, this);
      this.get = __bind(this.get, this);
      this.all = __bind(this.all, this);
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
      if (cb == null) {
        cb = function() {};
      }
      if (!_tenantId) {
        return cb(new Error(i18n.errorTenantIdRequired));
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
      if (cb == null) {
        cb = function() {};
      }
      if (!_tenantId) {
        return cb(new Error(i18n.errorTenantIdRequired));
      }
      settings = {};
      objs._tenantId = mongooseRestHelper.asObjectId(_tenantId);
      return mongooseRestHelper.create(this.models.OauthScope, settings, objs, options, cb);
    };


    /*
    Completely destroys an OauthScope object
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
    Updates an OauthScope.
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
