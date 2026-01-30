/**
 * BillingAccount.js
 */

module.exports = {
tableName: 'billingaccount',
  attributes: {

    isInternational: {
      type: 'boolean'
    },

    addressPart1: { type: 'string' },
    addressPart2: { type: 'string' },
    addressPart3: { type: 'string' },
    addressPart4: { type: 'string' },
    addressPart5: { type: 'string' },

    phone: { type: 'string' },
    fax: { type: 'string' },

    bookkeepingId: { type: 'string' },

    feeSchedule: {
      type: 'string',
      defaultsTo: 'Retail 1',
      isIn: [
        'Retail 1','Retail 2','Retail 3','Retail 4',
        'One Rate 1','One Rate 2','One Rate 3','One Rate 4',
        'Wholesale 1','Wholesale 2','Wholesale 3','Wholesale 4'
      ]
    },

    isMonthlyBillingSummaryEnabled: {
      type: 'boolean'
    },

    isEBilling: {
      type: 'boolean'
    },

    hubspotaccountlink: {
      type: 'string'
    },
    org: {
      columnName: 'org',
      model: 'org',
      required: true
    }
  },
  };

