(function() {
  var Boom, Hoek, OauthAppMethods, _, i18n, mongooseRestHelper, passgen,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  _ = require('underscore');

  Boom = require('boom');

  Hoek = require('hoek');

  mongooseRestHelper = require('mongoose-rest-helper');

  i18n = require('../i18n');

  passgen = require('passgen');

  module.exports = OauthAppMethods = (function() {
    var KEY_LENGTH, SECRET_LENGTH, UPDATE_EXCLUDEFIELDS;

    KEY_LENGTH = 20;

    SECRET_LENGTH = 40;

    UPDATE_EXCLUDEFIELDS = ['_id', 'createdAt'];

    function OauthAppMethods(models, oauthScopeMethods) {
      this.models = models;
      this.oauthScopeMethods = oauthScopeMethods;
      this.patch = bind(this.patch, this);
      this.resetAppKeys = bind(this.resetAppKeys, this);
      this.destroy = bind(this.destroy, this);
      this.get = bind(this.get, this);
      this.getAppsForUser = bind(this.getAppsForUser, this);
      this.all = bind(this.all, this);
      this.create = bind(this.create, this);
      Hoek.assert(this.models, i18n.assertModelsRequired);
      Hoek.assert(this.models.OauthScope, i18n.assertOauthScopeInModels);
      Hoek.assert(this.models.OauthApp, i18n.assertOauthAppInModels);
      Hoek.assert(this.models.OauthApp, i18n.assertOauthAppInModels);
      Hoek.assert(this.oauthScopeMethods, i18n.assertOauthScopeMethods);
    }


    /*
    Create a new oauth client.
     */

    OauthAppMethods.prototype.create = function(_tenantId, objs, options, cb) {
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
      objs._tenantId = mongooseRestHelper.asObjectId(_tenantId);
      return this.models.OauthScope.find({
        _tenantId: objs._tenantId
      }, (function(_this) {
        return function(err, scopes) {
          var model, oAuthClient, optionalClientId, optionalSecret;
          if (err) {
            return cb(err);
          }
          scopes = _.reject(scopes || [], function(x) {
            return x.isInternal;
          });
          optionalClientId = objs.clientId;
          optionalSecret = objs.secret;
          if (!(objs.scopes && objs.scopes.length > 0)) {
            objs.scopes = _.pluck(scopes || [], "name");
          }
          model = new _this.models.OauthApp(objs);
          if (objs.callbackUrl) {
            model.redirectUrls.push({
              uri: objs.callbackUrl
            });
          }
          oAuthClient = {};
          if (optionalClientId) {
            oAuthClient.clientId = optionalClientId;
          }
          if (optionalSecret) {
            oAuthClient.secret = optionalSecret;
          }
          model.clients = [oAuthClient];
          return model.save(function(err) {
            if (err) {
              return cb(err);
            }
            return cb(null, model);
          });
        };
      })(this));
    };


    /*
    Retrieves all oauth apps for a specific _tenantId
     */

    OauthAppMethods.prototype.all = function(_tenantId, options, cb) {
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
        defaultCount: 20
      };
      return mongooseRestHelper.all(this.models.OauthApp, settings, options, cb);
    };


    /*
    Retrieves apps for a specific user, within the _tenantId scope.
     */

    OauthAppMethods.prototype.getAppsForUser = function(_tenantId, owningUserId, options, cb) {
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
      if (!owningUserId) {
        return cb(Boom.badData(i18n.errorOwningUserIdRequired));
      }
      options.where || (options.where = {});
      options.where.createdByUserId = mongooseRestHelper.asObjectId(owningUserId);
      return this.all(_tenantId, options, cb);
    };


    /*
    returns a specific oauth app.
     */

    OauthAppMethods.prototype.get = function(oauthAppId, options, cb) {
      if (options == null) {
        options = {};
      }
      if (_.isFunction(options)) {
        cb = options;
        options = {};
      }
      Hoek.assert(_.isFunction(cb), "The required parameter cb is missing or not a function.");
      if (!oauthAppId) {
        return cb(Boom.badData(i18n.errorOauthAppIdRequired));
      }
      return mongooseRestHelper.getById(this.models.OauthApp, oauthAppId, null, options, cb);
    };


    /*
    Completely destroys an oauth app.
     */

    OauthAppMethods.prototype.destroy = function(oauthAppId, options, cb) {
      var settings;
      if (options == null) {
        options = {};
      }
      if (_.isFunction(options)) {
        cb = options;
        options = {};
      }
      Hoek.assert(_.isFunction(cb), "The required parameter cb is missing or not a function.");
      if (!oauthAppId) {
        return cb(Boom.badData(i18n.errorOauthAppIdRequired));
      }
      settings = {};
      return mongooseRestHelper.destroy(this.models.OauthApp, oauthAppId, settings, {}, cb);
    };


    /*
    Reset the app keys for an oauth app.
     */

    OauthAppMethods.prototype.resetAppKeys = function(oauthAppId, options, cb) {
      if (options == null) {
        options = {};
      }
      if (_.isFunction(options)) {
        cb = options;
        options = {};
      }
      Hoek.assert(_.isFunction(cb), "The required parameter cb is missing or not a function.");
      if (!oauthAppId) {
        return cb(Boom.badData(i18n.errorOauthAppIdRequired));
      }
      oauthAppId = mongooseRestHelper.asObjectId(oauthAppId);
      return this.models.OauthApp.findOne({
        _id: oauthAppId
      }, (function(_this) {
        return function(err, item) {
          if (err) {
            return cb(err);
          }
          item.clients[0].clientId = passgen.create(KEY_LENGTH);
          item.clients[0].secret = passgen.create(SECRET_LENGTH);
          return item.save(function(err) {
            if (err) {
              return cb(err);
            }
            return cb(null, item);
          });
        };
      })(this));
    };


    /*
    Update an app.
     */

    OauthAppMethods.prototype.patch = function(oauthAppId, obj, options, cb) {
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
      if (!oauthAppId) {
        return cb(Boom.badData(i18n.errorOauthAppIdRequired));
      }
      settings = {
        exclude: UPDATE_EXCLUDEFIELDS
      };
      return mongooseRestHelper.patch(this.models.OauthApp, oauthAppId, settings, obj, options, cb);
    };

    return OauthAppMethods;

  })();

}).call(this);

//# sourceMappingURL=oauth-app-methods.js.map
