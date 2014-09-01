should = require 'should'
helper = require './support/helper'
_ = require 'underscore'
mongoose = require 'mongoose'
fixtures = require './support/fixtures'
mongoHelper = require './support/mongo-helper'

describe 'testing scopes', ->

  before (cb) ->
    helper.start null, cb

  after (cb) ->
    helper.stop cb

  it 'should exist', ->
    should.exist helper.store.oauthApps

  describe 'CREATING AN APP', ->
    describe 'with ClientId no UserId', ->
      it 'should create an app', (cb) ->
        helper.store.oauthApps.create fixtures.someTenantId,fixtures.appWithClientId, {}, (err, appResult) ->
          should.not.exist err
          should.exist appResult

          appResult = JSON.parse(JSON.stringify(appResult))

          appResult.should.have.property 'createdAt'
          appResult.should.have.property 'updatedAt'
          appResult.should.have.property 'name',fixtures.appWithClientId.name
          appResult.should.have.property "websiteUrl"
          appResult.should.have.property "imageUrl"
          appResult.should.have.property "callbackUrl"
          appResult.should.have.property "notes"
          appResult.should.have.property "organizationName"
          appResult.should.have.property "organizationUrl"
          appResult.should.have.property "_tenantId",fixtures.someTenantId
          appResult.should.have.property "accessibleBy"
          appResult.should.have.property "tags"
          appResult.should.have.property "isDeleted",false
          appResult.should.have.property "deletedAt",null
          appResult.should.have.property "createdByUserId", null
          appResult.should.have.property "_id"
          appResult.should.have.property "stats"
          appResult.should.have.property "redirectUrls"

          appResult.should.have.property "tosAcceptanceDate"
          appResult.should.have.property "isPublished"
          appResult.should.have.property "acceptTermsOfService"
          appResult.should.have.property "description"

          appResult.should.have.property "scopes"
          appResult.should.have.property "clients"

          appResult.clients.should.be.instanceOf(Array).and.have.lengthOf(1)
          appResult.scopes.should.be.instanceOf(Array).and.have.lengthOf(3)

          client1 = appResult.clients[0]

          client1.should.have.property '_id'
          client1.should.have.property 'revokedAt',null
          client1.should.have.property 'createdAt'
          client1.should.have.property 'secret'
          client1.should.have.property 'clientId',fixtures.appWithClientId.clientId


          cb err

    describe 'with ClientId and UserId', ->
      it 'should create an app', (cb) ->
        helper.store.oauthApps.create fixtures.someTenantId,fixtures.appWithClientIdAndCreatedByUserId, {}, (err, appResult) ->
          should.not.exist err
          should.exist appResult

          appResult = JSON.parse(JSON.stringify(appResult))

          appResult.should.have.property "createdByUserId", fixtures.appWithClientIdAndCreatedByUserId.createdByUserId

          appResult.should.have.property "clients"
          appResult.clients.should.be.instanceOf(Array).and.have.lengthOf(1)
          client1 = appResult.clients[0]

          client1.should.have.property '_id'
          client1.should.have.property 'revokedAt',null
          client1.should.have.property 'createdAt'
          client1.should.have.property 'secret'
          client1.should.have.property 'clientId',fixtures.appWithClientIdAndCreatedByUserId.clientId

          cb err

    describe 'with NO ClientId and NO UserId', ->
      it 'should create an app', (cb) ->
        helper.store.oauthApps.create fixtures.someTenantId,fixtures.appWithNoClientIdAndNoCreatedByUserId, {}, (err, appResult) ->
          should.not.exist err
          should.exist appResult

          appResult = JSON.parse(JSON.stringify(appResult))

          appResult.should.have.property "createdByUserId", null
          appResult.should.have.property "clients"
          appResult.clients.should.be.instanceOf(Array).and.have.lengthOf(1)
          client1 = appResult.clients[0]

          client1.should.have.property '_id'
          client1.should.have.property 'revokedAt',null
          client1.should.have.property 'createdAt'
          client1.should.have.property 'secret'
          client1.should.have.property 'clientId'

          cb err
