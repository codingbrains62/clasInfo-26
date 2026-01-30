module.exports = {

sendMail: async function (template, templateData, obj) {
    try {
      /*sails.hooks.email.send( title, object, obj, function(err) {console.log(err || "Mail Sent!");})*/
      await sails.helpers.sendTemplateEmail.with({
        to: obj.to,
        // to: 'javier@clasinfo.com',subject: obj.subject,
        subject: obj.subject,
        template: template,
        templateData: templateData
      });
      sails.log('Mail sent:', obj.to);
    } catch (err) {
      sails.log.error('Mail error:', err);
    }
  }
};
