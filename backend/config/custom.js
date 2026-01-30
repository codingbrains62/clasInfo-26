/**
 * Custom configuration
 * (sails.config.custom)
 *
 * One-off settings specific to your application.
 *
 * For more information on custom configuration, visit:
 * https://sailsjs.com/config/custom
 */

module.exports.custom = {

  /***************************************************************************
  *                                                                          *
  * Any other custom config this Sails app should use during development.    *
  *                                                                          *
  ***************************************************************************/
  // sendgridSecret: 'SG.fake.3e0Bn0qSQVnwb1E4qNPz9JZP5vLZYqjh7sn8S93oSHU',
  // stripeSecret: 'sk_test_Zzd814nldl91104qor5911gjald',

  office365AppId: '2991788d-48c0-442d-9506-43339b09c92d',// aka "client ID"  (https://apps.dev.microsoft.com/#/application/2991788d-48c0-442d-9506-43339b09c92d)
  office365AppSecret: 'qzUAHF6dimicDIU6828!{+~',// aka "client secret" (or occasionally... "password"?  But not the password.  But kinda.  Basically it's the developer secret.)
  office365TenantId: 'clasinfo.onmicrosoft.com',//« Note, if you comment out the tenant id, if unspecified, our integration uses "common"

  // The sender that all outgoing emails will appear to come from.
  fromEmailAddress: 'donotreply@clasinfo.com',
  fromName: 'The CLASTrak Team',

  // Email address for receiving support messages & other correspondences.
  internalEmailAddress: 'clasit2020@gmail.com',

  // Whether to require proof of email address ownership any time a new user
  // signs up, or when an existing user attempts to change their email address.
  verifyEmailAddresses: true,


   baseUrl: 'http://localhost:8080/', // test server
  // baseUrl: 'http://cip.clasinfo.com:8080/',

  // The sender that all outgoing emails will appear to come from.
  fromEmailAddress: 'codingbrains145@gmail.com',
  fromName: 'CIP',
  internalEmailAddress: 'support+development@example.com',
  verifyEmailAddresses: false,
  smtp: {
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for 587
    auth: {
      user: 'codingbrains145@gmail.com',
      pass: 'aaaloqowdjvvrvfo' // 🔒 App Password (NOT your Gmail login password)
    }
  },
};
