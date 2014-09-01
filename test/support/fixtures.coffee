

module.exports = 
  appWithClientId :
      name : 'somename'
      websiteUrl: 'http://somesite.com'
      imageUrl: "http://someimage.com/test.jpg"
      callbackUrl: null
      notes: 'Some comment'
      newUserDefaultRoles: ['read','write']
      scopes: ['read','write','server-admin']
      description: 'Some description'
      acceptTermsOfService: true
      isPublished: true
      organizationName: 'someorg'
      organizationUrl: 'http://somesite.com'
      tosAcceptanceDate : new Date()
      redirectUrls: []
      clientId: '01234567890123456789000a'

  appWithClientIdAndCreatedByUserId :
      name : 'somename'
      websiteUrl: 'http://somesite.com'
      imageUrl: "http://someimage.com/test.jpg"
      callbackUrl: null
      notes: 'Some comment'
      newUserDefaultRoles: ['read','write']
      scopes: ['read','write','server-admin']
      description: 'Some description'
      acceptTermsOfService: true
      isPublished: true
      organizationName: 'someorg'
      organizationUrl: 'http://somesite.com'
      tosAcceptanceDate : new Date()
      redirectUrls: []
      clientId: '01234567890123456789010a'
      createdByUserId: '13a88c31413019245de27da0'

  appWithNoClientIdAndNoCreatedByUserId :
      name : 'somename'
      websiteUrl: 'http://somesite.com'
      imageUrl: "http://someimage.com/test.jpg"
      callbackUrl: null
      notes: 'Some comment'
      newUserDefaultRoles: ['read','write']
      scopes: ['read','write','server-admin']
      description: 'Some description'
      acceptTermsOfService: true
      isPublished: true
      organizationName: 'someorg'
      organizationUrl: 'http://somesite.com'
      tosAcceptanceDate : new Date()
      redirectUrls: []


  someUserId: '13a88c31413019245de27da0'
  someTenantId: '01234567890123456789000b'
  someClientId: '01234567890123456789000a'

  scopeA:
    name: 'read' 
    description: 'Allows this app to read your data.'
    developerDescription: 'Read access to the data'
    roles: []
    isInternal : false

  scopeB:
    name: 'write' 
    description: 'Allows this app to write your data.'
    developerDescription: 'Write access to the data'
    roles: []
    isInternal : false

  scopeC:
    name: 'server-admin' 
    description: 'Allows for the adminstration of the server.'
    developerDescription: 'Internal, only used within the platform'
    isInternal: true
    roles: ['server-admin']

  scopeInvalid: {}

