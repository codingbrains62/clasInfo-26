/**
 * Org.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
 tableName: 'org', 
  attributes: {
name: {
      type: 'string',
      required: true
    },
    category: {
      type: 'string',
      required: true,
      isIn: [
        'ABL/Factor',
        'Accounting firm',
        'Commercial bank',
        'Correspondent',
        'General business',
        'Law firm',
        'Leasing/Financing company',
        'Other',
        'REIT/Development/Title'
      ]
    },
    billingAccounts: {
      collection: 'billingAccount',
      via: 'org'
    }
  },

};

