(function() {
  var Boom, Hoek, OauthAppMethods, ObjectId, mongoose, mongooseRestHelper, passgen, _,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  _ = require('underscore-ext');

  Boom = require('boom');

  Hoek = require('hoek');

  mongoose = require("mongoose");

  mongooseRestHelper = require('mongoose-rest-helper');

  ObjectId = mongoose.Types.ObjectId;

  passgen = require('passgen');

  module.exports = OauthAppMethods = (function() {
    var KEY_LENGTH, SECRET_LENGTH, UPDATE_EXCLUDEFIELDS;

    KEY_LENGTH = 20;

    SECRET_LENGTH = 40;

    UPDATE_EXCLUDEFIELDS = ['_id', 'createdAt'];

    function OauthAppMethods(models, scopeMethods) {
      this.models = models;
      this.scopeMethods = scopeMethods;
      this.patch = __bind(this.patch, this);
      this.resetAppKeys = __bind(this.resetAppKeys, this);
      this.destroy = __bind(this.destroy, this);
      this.get = __bind(this.get, this);
      this.getAppsForUser = __bind(this.getAppsForUser, this);
      this.all = __bind(this.all, this);
      this.create = __bind(this.create, this);
      if (!this.models) {
        throw new Error("models parameter is required");
      }
      if (!this.scopeMethods) {
        throw new Error("scopeMethods parameter is required");
      }
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
      if (cb == null) {
        cb = function() {};
      }
      if (!_tenantId) {
        return cb(new Error("_tenantId parameter is required."));
      }
      if (_.isFunction(options)) {
        cb = options;
        options = {};
      }
      objs._tenantId = new ObjectId(_tenantId.toString());
      return this.models.OauthScope.find({
        _tenantId: objs._tenantId
      }, (function(_this) {
        return function(err, scopes) {
          var model, oAuthClient, optionalClientId, optionalSecret;
          if (err) {
            return cb(err);
          }
          optionalClientId = objs.clientId;
          optionalSecret = objs.secret;
          objs.scopes = _.pluck(scopes || [], "name");
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
          model.clients.push(oAuthClient);
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
      if (cb == null) {
        cb = function() {};
      }
      if (!_tenantId) {
        return cb(new Error("_tenantId parameter is required."));
      }
      if (!owningUserId) {
        return cb(new Error("owningUserId parameter is required."));
      }
      if (_.isFunction(options)) {
        cb = options;
        options = {};
      }
      options.where || (options.where = {});
      options.where.createdByUserId = new ObjectId(owningUserId.toString());
      return this.all(_tenantId, options, cb);
    };


    /*
    returns a specific oauth app.
     */

    OauthAppMethods.prototype.get = function(oauthAppId, options, cb) {
      if (options == null) {
        options = {};
      }
      if (cb == null) {
        cb = function() {};
      }
      if (!oauthAppId) {
        return cb(new Error("oauthAppId parameter is required."));
      }
      return mongooseRestHelper.getById(this.models.OauthApp, oauthAppId, null, options, cb);
    };


    /*
    Completely destroys an app.
     */

    OauthAppMethods.prototype.destroy = function(oauthAppId, options, cb) {
      var settings;
      if (options == null) {
        options = {};
      }
      if (cb == null) {
        cb = function() {};
      }
      if (!oauthAppId) {
        return cb(new Error("oauthAppId parameter is required."));
      }
      settings = {};
      return mongooseRestHelper.destroy(this.models.OauthApp, oauthAppId, settings, {}, cb);
    };


    /*
    Reset the app keys for an app.
     */

    OauthAppMethods.prototype.resetAppKeys = function(oauthAppId, options, cb) {
      if (options == null) {
        options = {};
      }
      if (cb == null) {
        cb = function() {};
      }
      if (!oauthAppId) {
        return cb(new Error("oauthAppId parameter is required."));
      }
      if (_.isFunction(options)) {
        cb = options;
        options = {};
      }
      oauthAppId = new ObjectId(oauthAppId.toString());
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
      if (cb == null) {
        cb = function() {};
      }
      if (!oauthAppId) {
        return cb(new Error("oauthAppId parameter is required."));
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
