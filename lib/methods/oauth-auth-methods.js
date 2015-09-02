(function() {
  var Boom, Hoek, OauthAuthMethods, _, i18n, mongooseRestHelper,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  _ = require('underscore');

  Boom = require('boom');

  Hoek = require('hoek');

  mongooseRestHelper = require('mongoose-rest-helper');

  i18n = require('../i18n');


  /*
  Provides methods to interact with the auth store.
   */

  module.exports = OauthAuthMethods = (function() {
    var DEFAULT_EXPIRATION, TENMINUTESINSECONDS, TENYEARSINSECONDS;

    TENYEARSINSECONDS = 60 * 60 * 24 * 365 * 10;

    TENMINUTESINSECONDS = 60 * 10;

    DEFAULT_EXPIRATION = 3600;


    /*
    Initializes a new instance of the @see AuthMethods class.
    @param {Object} models A collection of models to be used within the auth framework.
     */

    function OauthAuthMethods(models) {
      this.models = models;
      this.exchangeRefreshTokenForAccessToken = bind(this.exchangeRefreshTokenForAccessToken, this);
      this.exchangeAuthorizationCodeForAccessToken = bind(this.exchangeAuthorizationCodeForAccessToken, this);
      this.createTokenForUserId = bind(this.createTokenForUserId, this);
      this.createOrReuseTokenForUserId = bind(this.createOrReuseTokenForUserId, this);
      this.createAccessGrant = bind(this.createAccessGrant, this);
      this.validate = bind(this.validate, this);
      this.appForClientId = bind(this.appForClientId, this);
      this.currentDateAndSeconds = bind(this.currentDateAndSeconds, this);
      Hoek.assert(this.models, i18n.assertModelsRequired);
      Hoek.assert(this.models.OauthApp, i18n.assertOauthAppInModels);
      Hoek.assert(this.models.OauthAccessToken, i18n.assertOauthAccessTokenInModels);
      Hoek.assert(this.models.OauthAccessGrant, i18n.assertOauthAccessGrantInModels);
    }


    /*
    Returns the current date + seconds
    @param {Number} seconds The seconds, or if null then roughly 10 years is assumed.
     */

    OauthAuthMethods.prototype.currentDateAndSeconds = function(seconds) {
      var now;
      if (seconds == null) {
        seconds = TENYEARSINSECONDS;
      }
      now = new Date();
      now.setSeconds(now.getSeconds() + seconds);
      return now;
    };


    /*
    Retrieves an app for a key. This ONLY retrieves active keys
    @param {string} appKey the application key to retrieve the app for.
     */

    OauthAuthMethods.prototype.appForClientId = function(clientId, options, cb) {
      if (options == null) {
        options = {};
      }
      if (_.isFunction(options)) {
        cb = options;
        options = {};
      }
      Hoek.assert(_.isFunction(cb), "The required parameter cb is missing or not a function.");
      if (!clientId) {
        return cb(Boom.badData(i18n.errorClientIdRequired));
      }
      return this.models.OauthApp.findOne({
        'clients.clientId': clientId
      }, (function(_this) {
        return function(err, item) {
          if (err) {
            return cb(err);
          }
          return cb(null, item);
        };
      })(this));
    };


    /*
    Somehow validates a token. A valid token exists, has not been revoked yet,
    has an expiration higher than now.
    isClientValid can be checked for tighter security.
     */

    OauthAuthMethods.prototype.validate = function(token, clientId, options, cb) {
      if (options == null) {
        options = {};
      }
      if (_.isFunction(options)) {
        cb = options;
        options = {};
      }
      Hoek.assert(_.isFunction(cb), "The required parameter cb is missing or not a function.");
      if (!token) {
        return cb(Boom.badData(i18n.errorTokenRequired));
      }
      if (!clientId) {
        return cb(Boom.badData(i18n.errorClientIdRequired));
      }
      return this.models.OauthAccessToken.findOne({
        _id: token
      }, (function(_this) {
        return function(err, item) {
          if (err) {
            return cb(err);
          }
          if (!item) {
            return cb(null, {
              isValid: false
            });
          }
          return cb(null, {
            isValid: !item.revoked,
            isClientValid: true,
            actor: {
              actorId: item.identityUserId
            },
            clientId: clientId,
            scopes: item.scope || [],
            expiresIn: 10000
          });
        };
      })(this));
    };


    /*
    Creates a new access grant.
    @param {String || ObjectId} oauthAppId the mongoose app id.
    @param {String || ObjectId} userId the mongoose user id
    @param {String} redirectUrl the requested redirect_uri. This must be later matched when issuing an access token.
    @param {String[]} scope an array of strings, with one or more elements, specifying the scope that should be granted.
    @param {String} realm an optional realm for which this access grant is for.
    @param {Callback} cb the callback that will be invoked, with err and the mongoose AccessGrant model.
     */

    OauthAuthMethods.prototype.createAccessGrant = function(_tenantId, oauthAppId, userId, redirectUrl, scope, realm, options, cb) {
      var accessGrant;
      if (realm == null) {
        realm = null;
      }
      if (options == null) {
        options = {};
      }
      if (_.isFunction(options)) {
        cb = options;
        options = {};
      }
      Hoek.assert(_.isFunction(cb), "The required parameter cb is missing or not a function.");
      if (_.isString(scope)) {
        scope = [scope];
      }
      if (!_tenantId) {
        return cb(Boom.badData(i18n.errorTenantIdRequired));
      }
      if (!oauthAppId) {
        return cb(Boom.badData(i18n.errorOauthAppIdRequired));
      }
      if (!userId) {
        return cb(Boom.badData(i18n.errorUserIdRequired));
      }
      if (!redirectUrl) {
        return cb(Boom.badData(i18n.errorRedirectUrlRequired));
      }
      if (!(scope && _.isArray(scope) && scope.length > 0)) {
        return cb(Boom.badData(i18n.errorScopeRequiredAndArrayAndMinOne));
      }
      accessGrant = new this.models.OauthAccessGrant({
        _tenantId: _tenantId,
        appId: oauthAppId,
        identityUserId: userId,
        realm: realm,
        redirectUrl: redirectUrl,
        scope: scope,
        expiresAt: this.currentDateAndSeconds(TENMINUTESINSECONDS)
      });
      return accessGrant.save((function(_this) {
        return function(err) {
          if (err) {
            return cb(err);
          }
          return cb(null, accessGrant);
        };
      })(this));
    };


    /*
    Creates a token for a user/app/realm
     */

    OauthAuthMethods.prototype.createOrReuseTokenForUserId = function(_tenantId, userId, clientId, realm, scope, expiresIn, options, cb) {
      if (options == null) {
        options = {};
      }
      if (_.isFunction(options)) {
        cb = options;
        options = {};
      }
      Hoek.assert(_.isFunction(cb), "The required parameter cb is missing or not a function.");
      if (_.isString(scope)) {
        scope = [scope];
      }
      if (!_tenantId) {
        return cb(Boom.badData(i18n.errorTenantIdRequired));
      }
      if (!userId) {
        return cb(Boom.badData(i18n.errorUserIdRequired));
      }
      if (!clientId) {
        return cb(Boom.badData(i18n.errorClientIdRequired));
      }
      userId = mongooseRestHelper.asObjectId(userId);
      return this.appForClientId(clientId, (function(_this) {
        return function(err, app) {
          if (err) {
            return cb(err);
          }
          if (!app) {
            return cb(Boom.badRequest("Could not find app for clientId " + clientId));
          }
          return _this.models.OauthAccessToken.findOne({
            _tenantId: _tenantId,
            appId: app._id,
            identityUserId: userId
          }, function(err, token) {
            if (err) {
              return cb(err);
            }
            if (token) {
              return cb(null, token);
            }
            return _this.createTokenForUserId(_tenantId, userId, clientId, realm, scope, expiresIn, options, cb);
          });
        };
      })(this));
    };


    /*
    Creates a token for a user/app/realm
     */

    OauthAuthMethods.prototype.createTokenForUserId = function(_tenantId, userId, clientId, realm, scope, expiresIn, options, cb) {
      if (realm == null) {
        realm = null;
      }
      if (scope == null) {
        scope = null;
      }
      if (expiresIn == null) {
        expiresIn = null;
      }
      if (options == null) {
        options = {};
      }
      if (_.isFunction(options)) {
        cb = options;
        options = {};
      }
      Hoek.assert(_.isFunction(cb), "The required parameter cb is missing or not a function.");
      if (_.isString(scope)) {
        scope = [scope];
      }
      if (!_tenantId) {
        return cb(Boom.badData(i18n.errorTenantIdRequired));
      }
      if (!userId) {
        return cb(Boom.badData(i18n.errorUserIdRequired));
      }
      if (!clientId) {
        return cb(Boom.badData(i18n.errorClientIdRequired));
      }
      return this.appForClientId(clientId, (function(_this) {
        return function(err, app) {
          var token;
          if (err) {
            return cb(err);
          }
          if (!app) {
            return cb(Boom.notFound(i18n.prefixErrorNoAppForClientId + " " + clientId));
          }
          token = new _this.models.OauthAccessToken({
            _tenantId: _tenantId,
            appId: app._id,
            identityUserId: userId,
            realm: realm,
            expiresAt: _this.currentDateAndSeconds(expiresIn || DEFAULT_EXPIRATION),
            scope: scope && _.isArray(scope) && scope.length > 0 ? scope : app.scopes
          });
          return token.save(function(err) {
            if (err) {
              return cb(err);
            }
            return cb(null, token);
          });
        };
      })(this));
    };


    /*
    Takes a code and exchanges it for an access token
    @param {String} code the authorization_code to exchange into an access token
     */

    OauthAuthMethods.prototype.exchangeAuthorizationCodeForAccessToken = function(code, options, cb) {
      if (options == null) {
        options = {};
      }
      if (_.isFunction(options)) {
        cb = options;
        options = {};
      }
      Hoek.assert(_.isFunction(cb), "The required parameter cb is missing or not a function.");
      if (!refreshToken) {
        return cb(Boom.badData(i18n.errorCodeRequired));
      }
      return this.models.OauthAccessGrant.findOne({
        _id: code
      }, (function(_this) {
        return function(err, accessGrant) {
          var token;
          if (err) {
            return cb(err);
          }
          if (!accessGrant) {
            return cb(Boom.notFound(i18n.accessGrantNotFound));
          }
          token = new _this.models.OauthAccessToken({
            appId: accessGrant.appId,
            identityUserId: accessGrant.userId,
            realm: accessGrant.realm,
            expiresAt: _this.currentDateAndSeconds(DEFAULT_EXPIRATION),
            scope: accessGrant.scope
          });
          return token.save(function(err) {
            if (err) {
              return cb(err);
            }
            accessGrant.revokedAt = new Date();
            accessGrant.accessToken = token._id;
            return accessGrant.save(function(err) {
              if (err) {
                return cb(err);
              }
              return cb(null, token);
            });
          });
        };
      })(this));
    };


    /*
    Takes a code and exchanges it for an access token
    @param {String} refreshToken the refresh_token to exchange into an access token
     */

    OauthAuthMethods.prototype.exchangeRefreshTokenForAccessToken = function(refreshToken, options, cb) {
      if (options == null) {
        options = {};
      }
      if (_.isFunction(options)) {
        cb = options;
        options = {};
      }
      Hoek.assert(_.isFunction(cb), "The required parameter cb is missing or not a function.");
      if (!refreshToken) {
        return cb(Boom.badData(i18n.errorRefreshTokenRequired));
      }
      return this.models.OauthAccessToken.findOne({
        refreshToken: refreshToken
      }, (function(_this) {
        return function(err, token) {
          if (err) {
            return cb(err);
          }
          if (!token) {
            return cb(Boom.notFound(i18n.tokenNotFound));
          }
          token.refreshToken = null;
          return token.save(function(err) {
            var newToken;
            if (err) {
              return cb(err);
            }
            newToken = new _this.models.OauthAccessToken({
              _tenantId: token._tenantId,
              appId: token.appId,
              identityUserId: token.userId,
              realm: token.realm,
              expiresAt: _this.currentDateAndSeconds(DEFAULT_EXPIRATION),
              scope: token.scope
            });
            return newToken.save(function(err) {
              if (err) {
                return cb(err);
              }
              return cb(null, newToken);
            });
          });
        };
      })(this));
    };

    return OauthAuthMethods;

  })();

}).call(this);

//# sourceMappingURL=oauth-auth-methods.js.map
