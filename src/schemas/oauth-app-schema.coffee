_ = require 'underscore'
mongoose = require 'mongoose'
Schema = mongoose.Schema
OauthClientSchema = require './oauth-client-schema'
OauthRedirectUriSchema = require './oauth-redirect-uri-schema'

pluginTimestamp = require "mongoose-plugins-timestamp"
pluginCreatedBy = require "mongoose-plugins-created-by"
pluginDeleteParanoid = require "mongoose-plugins-delete-paranoid"
pluginTagsSimple = require "mongoose-plugins-tags-simple"
pluginAccessibleBy = require "mongoose-plugins-accessible-by"
errors = require 'some-errors'

StatsType =
  tokensGranted:
    type : Number
    default : 0
  tokensRevoked:
    type : Number
    default : 0


module.exports = OauthAppSchema = new mongoose.Schema
      _tenantId:
        type: mongoose.Schema.ObjectId
        require: true
        index: true
      name :
        type: String
      websiteUrl:
        type: String
      imageUrl:
        type: String
      callbackUrl:
        type: String
      notes:
        type: String
      scopes:
        type: [String]
        default: []
      revoked:
        type: Number
      description:
        type: String
        default: ''
      acceptTermsOfService:
        type: Boolean
        default: false
      isPublished:
        type: Boolean
        default: false
      organizationName:
        type: String
      organizationUrl:
        type: String

      tosAcceptanceDate :
        type: Date
        default: -> null

      #owningUserId:
      #  type: Schema.ObjectId
      #  ref: 'User'

      clients:
        type: [OauthClientSchema]
        default: () -> []

      redirectUrls:
        type: [OauthRedirectUriSchema]
        default: () -> []

      stats:
        type: StatsType
        default : () ->
          tokensGranted : 0
          tokensRevoked : 0

  ,
    strict: true
    collection: 'identitymt.oauthapps'


OauthAppSchema.plugin pluginTimestamp.timestamps
OauthAppSchema.plugin pluginCreatedBy.createdBy, {isRequired : false, v:2, keepV1 : false}
OauthAppSchema.plugin pluginDeleteParanoid.deleteParanoid
OauthAppSchema.plugin pluginTagsSimple.tagsSimple
OauthAppSchema.plugin pluginAccessibleBy.accessibleBy, defaultIsPublic : false


OauthAppSchema.virtual('key').get ->
  @clients[0].clientId

