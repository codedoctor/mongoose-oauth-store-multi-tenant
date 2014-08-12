mongoose = require 'mongoose'

module.exports = ScopeSchema = new mongoose.Schema
    _tenantId:
      type: mongoose.Schema.ObjectId
      require: true
    name:
      type : String
    description:
      type : String
      default: ''
    developerDescription:
      type : String
      default: ''
    roles:
      type: [String]
      default: -> []
  ,
    strict: true
    collection: 'identitymt.scopes'

ScopeSchema.index({ _tenantId: 1,name: 1 },{ unique: true, sparse: false} );
