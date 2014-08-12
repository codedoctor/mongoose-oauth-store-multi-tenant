(function() {
  var AdminMethods, Boom, Hoek, ObjectId, async, mongoose, _,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  _ = require('underscore-ext');

  async = require('async');

  Boom = require('boom');

  Hoek = require('hoek');

  mongoose = require("mongoose");

  ObjectId = mongoose.Types.ObjectId;


  /*
  Provides methods to interact with scotties.
   */

  module.exports = AdminMethods = (function() {

    /*
    Initializes a new instance of the @see ScottyMethods class.
    @param {Object} models A collection of models that can be used.
     */
    function AdminMethods(models, users, oauthApps, oauthAuth, oauthScopes) {
      this.models = models;
      this.users = users;
      this.oauthApps = oauthApps;
      this.oauthAuth = oauthAuth;
      this.oauthScopes = oauthScopes;
      this.setup = __bind(this.setup, this);
      if (!this.models) {
        throw new Error("models parameter is required");
      }
      if (!this.oauthApps) {
        throw new Error("oauthApps parameter is required");
      }
      if (!this.oauthAuth) {
        throw new Error("oauthAuth parameter is required");
      }
      if (!this.oauthScopes) {
        throw new Error("oauthScopes parameter is required");
      }
    }


    /*
    Sets up an account ready for use.
     */

    AdminMethods.prototype.setup = function(_tenantId, appName, username, email, password, scopes, clientId, secret, options, cb) {
      var adminUser, appData, user, _createScope;
      if (scopes == null) {
        scopes = [];
      }
      if (clientId == null) {
        clientId = null;
      }
      if (secret == null) {
        secret = null;
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
      if (!appName) {
        return cb(new Error("appName parameter is required."));
      }
      if (!username) {
        return cb(new Error("username parameter is required."));
      }
      if (!email) {
        return cb(new Error("email parameter is required."));
      }
      if (!password) {
        return cb(new Error("password parameter is required."));
      }
      if (_.isFunction(options)) {
        cb = options;
        options = {};
      }
      _tenantId = new ObjectId(_tenantId.toString());
      adminUser = {
        _tenantId: _tenantId,
        username: username,
        password: password,
        displayName: 'ADMIN',
        roles: ['admin', 'serveradmin'],
        email: email
      };
      user = {
        _id: "52998e1c32e5724771000009"
      };
      appData = {
        _tenantId: _tenantId,
        name: appName,
        clientId: clientId,
        secret: secret,
        createdByUserId: user._id
      };
      _createScope = (function(_this) {
        return function(scope, cb) {
          return _this.oauthScopes.create(_tenantId, scope, null, cb);
        };
      })(this);
      return async.map(scopes, _createScope, (function(_this) {
        return function(err, createdScopes) {
          if (err) {
            return cb(err);
          }
          return _this.oauthApps.create(_tenantId, appData, {}, function(err, app) {
            if (err) {
              return cb(err);
            }
            clientId = app.clients[0].clientId;
            if (!clientId) {
              return cb(new Error("Failed to create app client"));
            }
            return _this.oauthAuth.createOrReuseTokenForUserId(_tenantId, user._id, clientId, null, null, null, function(err, token) {
              if (err) {
                return cb(err);
              }
              if (!token) {
                return cb(new Error("Failed to create token"));
              }
              token = {
                accessToken: token.accessToken,
                refreshToken: token.refreshToken
              };
              return cb(null, app, user, token, createdScopes || []);
            });
          });
        };
      })(this));
    };

    return AdminMethods;

  })();

}).call(this);

//# sourceMappingURL=admin-methods.js.map
