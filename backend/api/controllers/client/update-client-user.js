module.exports = {

  friendlyName: 'Update client user',

  description: 'Update client user profile and log changes',

  inputs: {
    id: { type: 'string', required: true, description: 'Client user id' },
    email: { type: 'string', isEmail: true, allowNull: true },
    fullName: { type: 'string', allowNull: true },
    altemail: { type: 'string', allowNull: true },
    phone: { type: 'string', allowNull: true },
    cellphone: { type: 'string', allowNull: true },
    security_Level: { type: 'string', allowNull: true },
    billingaddressPart1: { type: 'string', allowNull: true },
    company_name: { type: 'string', allowNull: true }
  },

  exits: {
    success: { statusCode: 200 },
    badRequest: { statusCode: 400 }
  },

  fn: async function (inputs, exits) {

    const req = this.req;
    const res = this.res;
    try {

      /* ---------------- VALIDATION ---------------- */

      let errors = [];

      const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      const phoneRegex = /^\d{10}$/;
      const nameRegex = /^[a-zA-Z ]+$/;

      if (inputs.email && !emailRegex.test(inputs.email)) {
        errors.push('Invalid email address');
      }

      if (inputs.altemail && !emailRegex.test(inputs.altemail)) {
        errors.push('Invalid alternate email address');
      }

      if (inputs.fullName && !nameRegex.test(inputs.fullName)) {
        errors.push('Invalid full name');
      }

      if (inputs.phone && !phoneRegex.test(inputs.phone)) {
        errors.push('Phone number must be 10 digits');
      }

      if (errors.length > 0) {
        return res.json({
          record: {
            status: 'error',
            status_code: 400,
            message: errors
          }
        });
      }

      /* ---------------- FETCH CLIENT ---------------- */

      const client = await Client.findOne({ id: inputs.id });

      if (!client) {
        return res.json({
          record: {
            status: 'error',
            status_code: 404,
            message: 'Client not found'
          }
        });
      }

      /* ---------------- UPDATE CLIENT ---------------- */

      const updateData = {
        fullName: inputs.fullName,
        alternateEmailAddress: inputs.altemail,
        phone: inputs.phone,
        cellPhone: inputs.cellphone,
        SecurityLevel: inputs.security_Level
      };

      await Client.updateOne({ id: inputs.id }).set(updateData);

      /* ---------------- LOG HISTORY ---------------- */

      await HistoricalEvent.create({
        description: 'User profile updated successfully',
        actorId: inputs.id,
        actorType: 'Client',
        actorDisplayName: inputs.fullName || client.fullName,
        category: 'Other'
      });

      /* ---------------- CHANGE TRACKING ---------------- */

      let editedFields = [];

      const trackChange = (column, oldVal, newVal) => {
        if (oldVal !== newVal) {
          editedFields.push({
            column,
            current_record: oldVal,
            new_record: newVal
          });
        }
      };

      trackChange('fullName', client.fullName, inputs.fullName);
      trackChange('alternateEmailAddress', client.alternateEmailAddress, inputs.altemail);
      trackChange('phone', client.phone, inputs.phone);
      trackChange('cellPhone', client.cellPhone, inputs.cellphone);
      trackChange('SecurityLevel', client.SecurityLevel, inputs.security_Level);

      if (editedFields.length > 0) {
        await Mailer.sendMail(
          'userupdated',
          {
            Name: inputs.fullName || client.fullName,
            dataobj: editedFields,
            request_page: 'edit'
          },
          {
            to: client.emailAddress,
            subject: 'Profile Updated Successfully'
          }
        );
      }

      /* ---------------- BILLING / ORG REQUEST ---------------- */

      let requestChanges = [];

      if (inputs.email && client.emailAddress !== inputs.email) {
        requestChanges.push({
          column: 'emailAddress',
          current_record: client.emailAddress,
          new_record: inputs.email
        });
      }

      const billingAccount = await BillingAccount.findOne({ id: client.billingAccount });
      if (billingAccount && billingAccount.addressPart1 !== inputs.billingaddressPart1) {
        requestChanges.push({
          column: 'addressPart1',
          current_record: billingAccount.addressPart1,
          new_record: inputs.billingaddressPart1
        });
      }

      const org = billingAccount ? await Org.findOne({ id: billingAccount.org }) : null;
      if (org && org.name !== inputs.company_name) {
        requestChanges.push({
          column: 'Company Name',
          current_record: org.name,
          new_record: inputs.company_name
        });
      }

      if (requestChanges.length > 0) {
        await Mailer.sendMail(
          'userupdaterequest',
          {
            Name: inputs.fullName || client.fullName,
            dataobj: requestChanges,
            request_page: 'edit'
          },
          {
            to: 'codingbrains62@gmail.com',
            subject: 'Edit Request'
          }
        );

        return res.json({
          record: {
            status: 'success',
            status_code: 200,
            message: 'Update request sent successfully'
          }
        });
      }

      /* ---------------- FINAL RESPONSE ---------------- */

      return res.json({
        record: {
          status: 'success',
          status_code: 200,
          message: 'Record updated successfully'
        }
      });

    } catch (err) {

      sails.log.error(err);

      return res.json({
        record: {
          status: 'error',
          status_code: 500,
          message: 'Internal Server Error'
        }
      });
    }
  }

};
