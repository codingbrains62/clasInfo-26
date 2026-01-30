/**
  Client.js
 **/
const bcrypt = require('bcrypt');
const _ = require('@sailshq/lodash');

module.exports = {
  tableName: 'client',

  attributes: {
    fullName: { type: 'string', required: true, columnType: 'varchar(120)' },
    emailAddress: { type: 'string', required: true, isEmail: true, columnType: 'varchar(200)', unique: true },
    alternateEmailAddress: { type: 'string', isEmail: true, columnType: 'varchar(200)' },
    mandate: { type: 'string', required: true, isIn: ['Corporate','Finance','Intellectual property','Litigation','Real estate','Other','General Counsel'], columnType: 'varchar(50)' },
    phone: { type: 'string', columnType: 'varchar(50)' },
    cellPhone: { type: 'string', columnType: 'varchar(50)' },
    username: { type: 'string', required: true, columnType: 'varchar(200)', unique: true },
    password: { type: 'string', required: true, protect: true, columnType: 'varchar(255)' },
    lastSeenAt: { type: 'number', columnType: 'bigint' },
    SecurityLevel: { type: 'string', columnType: 'varchar(120)' },
    token: { type: 'string', columnType: 'varchar(255)' },
    isDisabled: { type: 'boolean', defaultsTo: false, columnType: 'bit' },
    isOnHold: { type: 'boolean', defaultsTo: false, columnType: 'bit' },
    isDeleted: { type: 'boolean', defaultsTo: false, columnType: 'bit' },
    bookkeepingId: { type: 'string', columnType: 'varchar(50)' },
    WebsiteLinkID: { type: 'number', columnType: 'int' },
    perInvoiceMax: { type: 'number', columnType: 'decimal(18,2)' },
    ebilling: { type: 'boolean', columnType: 'bit' },
    alwayschargecc: { type: 'boolean', columnType: 'bit' },
    isonhubspot: { type: 'boolean', columnType: 'bit' },
    HubspotClientLink: { type: 'string', columnType: 'varchar(100)' },
    createdBy: { type: 'number', columnType: 'int' },
    billingAccount: { model: 'billingaccount', required: true }
  },

  // Hide password
  customToJSON: function() {
    return _.omit(this, ['password']);
  },

  beforeCreate: async function(client, proceed) {
    if (client.password) {
      try {
        const salt = await bcrypt.genSalt(10);
        client.password = await bcrypt.hash(client.password, salt);
      } catch (err) {
        return proceed(err);
      }
    }
    return proceed();
  },

  beforeUpdate: async function(client, proceed) {
    if (client.password) {
      try {
        const salt = await bcrypt.genSalt(10);
        client.password = await bcrypt.hash(client.password, salt);
      } catch (err) {
        return proceed(err);
      }
    }
    return proceed();
  }
};
