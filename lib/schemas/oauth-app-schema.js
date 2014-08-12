(function() {
  var OauthAppSchema, OauthClientSchema, OauthRedirectUriSchema, StatsType, mongoose, pluginAccessibleBy, pluginCreatedBy, pluginDeleteParanoid, pluginTagsSimple, pluginTimestamp, _;

  _ = require('underscore');

  mongoose = require('mongoose');

  OauthClientSchema = require('./oauth-client-schema');

  OauthRedirectUriSchema = require('./oauth-redirect-uri-schema');

  pluginTimestamp = require("mongoose-plugins-timestamp");

  pluginCreatedBy = require("mongoose-plugins-created-by");

  pluginDeleteParanoid = require("mongoose-plugins-delete-paranoid");

  pluginTagsSimple = require("mongoose-plugins-tags-simple");

  pluginAccessibleBy = require("mongoose-plugins-accessible-by");

  StatsType = {
    tokensGranted: {
      type: Number,
      "default": 0
    },
    tokensRevoked: {
      type: Number,
      "default": 0
    }
  };

  module.exports = OauthAppSchema = new mongoose.Schema({
    _tenantId: {
      type: mongoose.Schema.ObjectId,
      require: true,
      index: true
    },
    name: {
      type: String
    },
    websiteUrl: {
      type: String
    },
    imageUrl: {
      type: String
    },
    callbackUrl: {
      type: String
    },
    notes: {
      type: String
    },
    scopes: {
      type: [String],
      "default": []
    },
    revoked: {
      type: Number
    },
    description: {
      type: String,
      "default": ''
    },
    acceptTermsOfService: {
      type: Boolean,
      "default": false
    },
    isPublished: {
      type: Boolean,
      "default": false
    },
    organizationName: {
      type: String
    },
    organizationUrl: {
      type: String
    },
    tosAcceptanceDate: {
      type: Date,
      "default": function() {
        return null;
      }
    },
    clients: {
      type: [OauthClientSchema],
      "default": function() {
        return [];
      }
    },
    redirectUrls: {
      type: [OauthRedirectUriSchema],
      "default": function() {
        return [];
      }
    },
    stats: {
      type: StatsType,
      "default": function() {
        return {
          tokensGranted: 0,
          tokensRevoked: 0
        };
      }
    }
  }, {
    strict: true,
    collection: 'identitymt.oauthapps'
  });

  OauthAppSchema.plugin(pluginTimestamp.timestamps);

  OauthAppSchema.plugin(pluginCreatedBy.createdBy, {
    isRequired: false,
    v: 2,
    keepV1: false
  });

  OauthAppSchema.plugin(pluginDeleteParanoid.deleteParanoid);

  OauthAppSchema.plugin(pluginTagsSimple.tagsSimple);

  OauthAppSchema.plugin(pluginAccessibleBy.accessibleBy, {
    defaultIsPublic: false
  });

  OauthAppSchema.virtual('key').get(function() {
    return this.clients[0].clientId;
  });

}).call(this);

//# sourceMappingURL=oauth-app-schema.js.map
