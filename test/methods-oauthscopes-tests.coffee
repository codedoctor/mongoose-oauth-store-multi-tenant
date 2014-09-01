_ = require 'underscore'
should = require 'should'

helper = require './support/helper'
fixtures = require './support/fixtures'
mongoHelper = require './support/mongo-helper'

describe 'testing scopes', ->
  before (cb) ->
    helper.start null, cb

  after (cb) ->
    helper.stop cb

  it 'should exist', ->
    should.exist helper.store.oauthScopes

  describe 'WHEN creating a scope', ->
    it 'SHOULD CREATE ONE', (cb) ->
      helper.store.oauthScopes.create fixtures.someTenantId, fixtures.scopeA,{}, (err,result) ->
        return cb err if err
        should.exist result
        result.should.have.property "name",fixtures.scopeA.name
        result.should.have.property "description",fixtures.scopeA.description
        result.should.have.property "developerDescription",fixtures.scopeA.developerDescription
        result.should.have.property "roles"
        result.should.have.property "isInternal",false
        result.roles.should.be.instanceOf(Array).with.lengthOf(0)

        cb err

    it 'SHOULD NOT CREATE DUPLICATES', (cb) ->
      helper.store.oauthScopes.create fixtures.someTenantId, fixtures.scopeA,{}, (err,result) ->
        should.exist err
        cb()


