(function() {
  var OauthClientSchema, Schema, mongoose, passgen;

  mongoose = require('mongoose');

  Schema = mongoose.Schema;

  passgen = require('passgen');

  module.exports = OauthClientSchema = new mongoose.Schema({
    clientId: {
      type: String,
      unique: true,
      sparse: true,
      "default": function() {
        return passgen.create(20);
      }
    },
    secret: {
      type: String,
      "default": function() {
        return passgen.create(40);
      }
    },
    createdAt: {
      type: Date,
      "default": function() {
        return new Date();
      }
    },
    revokedAt: {
      type: Date,
      "default": function() {
        return null;
      }
    }
  }, {
    strict: true
  });

}).call(this);

//# sourceMappingURL=oauth-client-schema.js.map
