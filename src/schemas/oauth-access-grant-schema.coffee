mongoose = require 'mongoose'
Schema = mongoose.Schema

###
A single, one time usable, access grant.
###
module.exports  = OauthAccessGrantSchema = new mongoose.Schema
      _tenantId:
        type: mongoose.Schema.ObjectId
        require: true

      appId:
        type: Schema.ObjectId

      realm:
        type: String

      #clientId:
      #  type: String

      ###
      The type of identity. This is for future use.
      ###
      identityType:
        type: String
        default: "user"

      ###
      The user id of the entity this was issued to, if available.
      ###
      identityUserId:
        type: Schema.ObjectId
        ref: 'User'

      redirectUrl:
        type: String

      scope:
        type: [String]
        default: () -> []

      createdAt:
        type: Date
        default:() -> new Date()

      grantedAt:
        type: Date
        default:() -> new Date()

      expiresAt:
        type: Date
        default: null

      revokedAt:
        type: Date
        default : null

      accessTokenId:
        type: Schema.ObjectId
        default: null
        #ref: 'AccessToken'
    , strict : true
