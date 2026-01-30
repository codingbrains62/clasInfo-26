module.exports = {

  friendlyName: 'Add client user',

  description: 'Create a new client user',

  inputs: {
    username: { type: 'string', required: true },
    password: { type: 'string', required: true },
    fullName: { type: 'string', required: true },
    email: { type: 'string', required: true },
    altemail: { type: 'string' },
    phone: { type: 'string', required: true },
    cellphone: { type: 'string' },
    security_Level: { type: 'string', required: true },
    billingaddressPart1: { type: 'string', required: true },
    company_name: { type: 'string', required: true },
    created_by: { type: 'number', required: true }
  },

  exits: {
    success: { statusCode: 200 },
    validationError: { statusCode: 400 },
    conflict: { statusCode: 409 },
    serverError: { statusCode: 500 }
  },

  fn: async function (inputs, exits) {
    sails.log('🔥 ADD USER API HIT');
    try {

      /* ---------------- VALIDATION ---------------- */

      const errors = [];

      const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
      const alphaRegex = /^[A-Za-z ]+$/;
      const phoneRegex = /^\d{10}$/;

      if (!emailRegex.test(inputs.email)) errors.push('Invalid email address');
      if (!passwordRegex.test(inputs.password)) errors.push('Weak password');
      if (!alphaRegex.test(inputs.company_name)) errors.push('Invalid company name');
      if (!alphaRegex.test(inputs.fullName)) errors.push('Invalid full name');
      if (!phoneRegex.test(inputs.phone)) errors.push('Phone must be 10 digits');

      if (inputs.altemail) {
        if (!emailRegex.test(inputs.altemail)) errors.push('Invalid alternate email');
        if (inputs.email === inputs.altemail) errors.push('Emails must be different');
      }

      if (errors.length) {
        return exits.validationError({
          status: 'error',
          message: errors
        });
      }

      /* ---------------- DUPLICATE CHECK ---------------- */

      const existingUser = await Client.findOne({ username: inputs.username });
      if (existingUser) {
        return exits.conflict({
          status: 'error',
          message: 'Username already exists'
        });
      }

      /* ---------------- CREATE ORG ---------------- */

      const org = await Org.create({
        name: inputs.company_name,
        category: 'ABL/Factor'
      }).fetch();

      /* ---------------- CREATE BILLING ACCOUNT ---------------- */

      const billingAccount = await BillingAccount.create({
        addressPart1: inputs.billingaddressPart1,
        org: org.id
      }).fetch();

      /* ---------------- CREATE CLIENT ---------------- */

      const client = await Client.create({
        username: inputs.username,
        password: inputs.password, // auto-hashed in model
        fullName: inputs.fullName,
        emailAddress: inputs.email,
        alternateEmailAddress: inputs.altemail,
        phone: inputs.phone,
        cellPhone: inputs.cellphone,
        SecurityLevel: inputs.security_Level,
        billingAccount: billingAccount.id,
        mandate: 'Corporate',
        createdBy: inputs.created_by
      }).fetch();

      /* ---------------- POST UPDATE ---------------- */

      await Client.updateOne({ id: client.id })
        .set({ WebsiteLinkID: client.id, bookkeepingId: client.id });

      await BillingAccount.updateOne({ id: billingAccount.id })
        .set({ WebsiteLinkID: client.id, bookkeepingId: client.id });

      /* ---------------- LOG ---------------- */

      await HistoricalEvent.create({
        description: 'Client user created',
        actorId: client.id,
        actorType: 'Client',
        actorDisplayName: inputs.fullName,
        category: 'Other'
      });

      /* ---------------- RESPONSE ---------------- */

      return exits.success({
        status: 'success',
        message: 'User added successfully'
      });

    } catch (err) {

      sails.log.error(err);
      return exits.serverError({
        status: 'error',
        message: 'Internal server error'
      });

    }
  }

};
