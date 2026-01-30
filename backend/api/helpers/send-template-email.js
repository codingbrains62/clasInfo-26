module.exports = {


  friendlyName: 'Send template email',


  description: 'Send an email using a template.',


  extendedDescription: 'To ease testing and development, if the provided "to" email address ends in "@example.com", '+
    'then the email message will be written to the terminal instead of actually being sent.'+
    '(Thanks [@simonratner](https://github.com/simonratner)!)',


  inputs: {

    template: {
      description: 'The relative path to an EJS template within our `views/emails/` folder -- WITHOUT the file extension.',
      extendedDescription: 'Use strings like "foo" or "foo/bar", but NEVER "foo/bar.ejs".  For example, '+
        '"marketing/welcome" would send an email using the "views/emails/marketing/welcome.ejs" template.',
      example: 'email-reset-password',
      type: 'string',
      required: true
    },

    templateData: {
      description: 'A dictionary of data which will be accessible in the EJS template.',
      extendedDescription: 'Each key will be a local variable accessible in the template.  For instance, if you supply '+
        'a dictionary with a \`friends\` key, and \`friends\` is an array like \`[{name:"Chandra"}, {name:"Mary"}]\`),'+
        'then you will be able to access \`friends\` from the template:\n'+
        '\`\`\`\n'+
        '<ul>\n'+
         '<% for (friend of friends){ %><li><%= friend.name %></li><% }); %>\n'+
        '</ul>\n'+
        '\`\`\`'+
        '\n'+
        'This is EJS, so use \`<%= %>\` to inject the HTML-escaped content of a variable, \`<%= %>\` to skip HTML-escaping '+
        'and inject the data as-is, or \`<% %>\` to execute some JavaScript code such as an \`if\` statement or \`for\` loop.',
      type: {},
      defaultsTo: {}
    },

    to: {
      description: 'The email address(es) of the primary recipient.',
      extendedDescription: 'If this (/all of these) email address(es) ends in "@example.com", then this will not actually deliver the message. '+
        'Instead, it will just be logged to the console.  (Note that sending will only be skipped if ALL recipient email addresses end in example.com!)',
      custom: (to)=>(
        (_.isString(to) && to !== '') ||
        (_.isArray(to) && to.every((email)=>_.isString(email) && email !== ''))
      ),
      required: true
    },

    from: {
      description: 'The email address to use when sending this email.',
      extendedDescription: 'If unspecified, or if this ends in something other than "clasinfo.com" or "clasinfo.onmicrosoft.com", '+
      'then a default fallback email from a default outbox will be used.',
      type: 'string'
    },

    subject: {
      description: 'The subject of the email.',
      example: 'Hello there.',
      defaultsTo: ''
    },

    attachments: {
      description: 'An array representing file attachments to include in this email, with the actual file content included as a base64-encoded string (`.contentBytes`).',
      extendedDescription: 'Other information is also included as `.name` and `.type`, if available.',
      type: [
        {
          name: 'string',
          type: 'string',
          contentBytes: 'string'
        }
      ],
      defaultsTo: []
    },

    layout: {
      description: 'Set to `false` to disable layouts altogether, or provide the path (relative '+
        'from `views/layouts/`) to an override email layout.',
      defaultsTo: 'layout-email',
      custom: (layout)=>layout===false || _.isString(layout)
    },

    ensureAck: {
      description: 'Whether to wait for acknowledgement (to hear back) that the email was successfully sent (or at least queued for sending) before returning.',
      extendedDescription: 'Otherwise by default, this returns immediately and delivers the request to deliver this email in the background.',
      type: 'boolean',
      defaultsTo: false
    }

  },


  exits: {

    success: {
      outputFriendlyName: 'Email delivery report',
      outputDescription: 'A dictionary of information about what went down.',
      outputType: {
        loggedInsteadOfSending: 'boolean'
      }
    },

    tooBig: {
      description: 'The message was too large be sent, likely due to large attachments.'
    }

  },


  fn: async function(inputs) {

    var path = require('path');
    var url = require('url');
    var util = require('util');


   

    // Determine appropriate email layout and template to use.
    var emailTemplatePath = path.join('emailTemplates/', inputs.template);
    var layout;
    if (inputs.layout) {
      layout = path.relative(path.dirname(emailTemplatePath), path.resolve('layouts/', inputs.layout));
    } else {
      layout = false;
    }

    // Compile HTML template.
    // > Note that we set the layout, provide access to core `url` package (for
    // > building links and image srcs, etc.), and also provide access to core
    // > `util` package (for dumping debug data in internal emails).
    var htmlEmailContents = await sails.renderView(
      emailTemplatePath,
      _.extend({layout, url, util }, inputs.templateData)
    )
    .intercept((err)=>{
      err.message =
      'Could not compile view template.\n'+
      '(Usually, this means the provided data is invalid, or missing a piece.)\n'+
      'Details:\n'+
      err.message;
      return err;
    });

    // Sometimes only log info to the console about the email that WOULD have been sent.
    // Specifically, if the "To" email address is anything "@example.com".
    //
    // > This is used below when determining whether to actually send the email,
    // > for convenience during development, but also for safety.  (For example,
    // > a special-cased version of "user@example.com" is used by Trend Micro Mars
    // > scanner to "check apks for malware".)
    var areAllToAddressesConsideredFake = (
      (_.isArray(inputs.to) ? inputs.to : [inputs.to])
      .every((email)=>Boolean(email.match(/@example\.com$/i)))
    );

    // If that's the case, or if we're in the "test" environment, then log
    // the email instead of sending it:
    var dontActuallySend = (
      sails.config.environment === 'test' || areAllToAddressesConsideredFake
    );
    if (dontActuallySend) {
      sails.log(
        'Skipped sending email, either because the "To" email address(es) ended '+
        'in "@example.com" or because the current \`sails.config.environment\` '+
        'is set to "test".\n'+
        '\n'+
        'But anyway, here is what WOULD have been sent:\n'+
        '-=-=-=-=-=-=-=-=-=-=-=-=-= Email log =-=-=-=-=-=-=-=-=-=-=-=-=-\n'+
        'To: '+inputs.to+'\n'+
        'Subject: '+inputs.subject+'\n'+
        '\n'+
        'Body:\n'+
        htmlEmailContents+'\n'+
        '-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-'
      );
    } else {
      // Otherwise, we'll check that all required credentials are set up
      // and, if so, continue to actually send the email.
      if (!sails.config.custom.office365AppId || !sails.config.custom.office365AppSecret) {
        throw new Error(
          'Cannot deliver email to "'+inputs.to+'" because:\n'+
          (()=>{
            let problems = [];
            if (!sails.config.custom.office365AppSecret) {
              problems.push(' • The "Office 365 app secret" setting is missing from this app\'s configuration (`sails.config.custom.office365AppSecret`)');
            }
            if (!sails.config.custom.office365AppId) {
              problems.push(' • The "Office 365 app ID" setting is missing from this app\'s configuration (`sails.config.custom.office365AppId`)');
            }
            return problems.join('\n');
          })()+
          '\n'+
          'To resolve these configuration issues, add the missing config variables to\n'+
          '\`config/custom.js\`-- or in staging/production, set them up as system\n'+
          'environment vars.\n'+
          '\n'+
          '> Note that, for convenience during development, there is another alternative:\n'+
          '> In lieu of setting up real Office 365 credentials, you can "fake" email\n'+
          '> delivery by using any email address that ends in "@example.com".  This will\n'+
          '> write automated emails to your logs rather than actually sending them.\n'+
          '> (To simulate clicking on a link from an email, just copy and paste the link\n'+
          '> from the terminal output into your browser.)\n'+
          '\n'+
          '[?] If you\'re unsure, visit https://sailsjs.com/support'
        );
      }


      // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
      // After some research, looks like we can probably use the "client credentials grant" approach for most things:
      // https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-client-creds-grant-flow
      // (hopefully?)
      // Note that you have to do this whole thing too though:
      // https://login.microsoftonline.com/clasinfo.onmicrosoft.com/adminconsent?client_id=2991788d-48c0-442d-9506-43339b09c92d&state=12345&redirect_uri=http://localhost:1337/why-do-i-have-to-do-this
      //
      // Anyway for posterity, here's the old way:
      // ```
      // // see https://docs.microsoft.com/en-us/azure/active-directory/develop/active-directory-v2-protocols#endpoints
      // let refreshTokenUrl = 'https://login.microsoftonline.com/'+encodeURIComponent(sails.config.custom.office365TenantId || 'common')+'/oauth2/v2.0/token';
      // await sails.helpers.http.post(refreshTokenUrl, {
      //   refresh_token: objUserIntergration.UserRefreshToken,//eslint-disable-line camelcase
      //   grant_type: 'refresh_token',//eslint-disable-line camelcase
      //   scope:' offline_access user.read mail.read',
      //   redirect_uri: url.resolve(sails.config.custom.baseUrl, '/Intergrations/Office365Intergration/SecureResponseCode'),//eslint-disable-line camelcase
      //   client_id: sails.config.custom.office365AppId,//eslint-disable-line camelcase
      //   client_secret: sails.config.custom.office365AppSecret//eslint-disable-line camelcase
      // });
      // ```
      // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

      // Get Office 365 access token:
      // Lookup cached access token, if it exists and it's fresh enough.
      // Otherwise fetch a new one.
      // > Note that we use a 10 minute buffer on our expiration timestamp.
      var accessToken;
      {
        let platform = (await sails.models.platform.find())[0];
        let TEN_MINUTES_OF_WIGGLE_ROOM = 10*60*1000;
        if (platform.office365AccessToken && Date.now() < (platform.office365AccessTokenExpiresAt - TEN_MINUTES_OF_WIGGLE_ROOM)) {
          accessToken = platform.office365AccessToken;
        } else {
          let apiResponse = await sails.helpers.http.sendHttpRequest.with({//« https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-client-creds-grant-flow
            method: 'post',
            url: 'https://login.microsoftonline.com/'+encodeURIComponent(sails.config.custom.office365TenantId || 'common')+'/oauth2/v2.0/token',
            enctype: 'application/x-www-form-urlencoded',
            body: {
              grant_type: 'client_credentials',//eslint-disable-line camelcase
              scope:' https://graph.microsoft.com/.default',
              client_id: sails.config.custom.office365AppId,//eslint-disable-line camelcase
              client_secret: sails.config.custom.office365AppSecret//eslint-disable-line camelcase
            },
          })
          .timeout(5000)
          .retry();
          accessToken = JSON.parse(apiResponse.body).access_token;

          let ONE_HOUR = 60*60*1000;
          await Platform.update({})
          .set({
            office365AccessToken: accessToken,
            office365AccessTokenExpiresAt: Date.now() + ONE_HOUR,
          });
        }//ﬁ
      }//∫

      // Determine which email address this message should be sent from
      var fromEmailAddress;
      if (inputs.from && inputs.from.match(/(clasinfo\.com|clasinfo\.onmicrosoft\.com)$/)) {
        fromEmailAddress = inputs.from;
      } else {
        fromEmailAddress = 'donotreply@clasinfo.onmicrosoft.com';
      }

      // Now actually send the email
      var deferred = sails.helpers.http.post.with({//« https://developer.microsoft.com/en-us/graph/docs/api-reference/v1.0/api/user_sendmail
        url: 'https://graph.microsoft.com/v1.0/users/'+encodeURIComponent(fromEmailAddress)+'/sendMail',
        data: {
          saveToSentItems: 'true',//« FUTURE: test whether this also works with the boolean `true` (to see if they actually mean for this to be the string "true" or the boolean true)
          message: {//« https://developer.microsoft.com/en-us/graph/docs/api-reference/v1.0/resources/message
            toRecipients: (_.isString(inputs.to) ? [ inputs.to ] : inputs.to).map((email)=>({
              emailAddress: { address: email }
            })),
            subject: inputs.subject,
            body: {//« https://developer.microsoft.com/en-us/graph/docs/api-reference/v1.0/resources/itembody
              contentType: 'HTML',
              content: htmlEmailContents
            },
            attachments: (//« https://developer.microsoft.com/en-us/graph/docs/api-reference/v1.0/resources/message#relationships, https://developer.microsoft.com/en-us/graph/docs/api-reference/v1.0/api/message_post_attachments, https://developer.microsoft.com/en-us/graph/docs/api-reference/v1.0/resources/fileattachment, and https://developer.microsoft.com/en-us/graph/docs/api-reference/v1.0/resources/attachment
              inputs.attachments.map((attachment)=>({
                name: attachment.name,
                contentBytes: attachment.contentBytes,
                '@odata.type': '#microsoft.graph.fileAttachment'
              }))
            )
          }
        },
        headers: {
          Authorization: 'Bearer '+accessToken
        }
      })
      .intercept('non200Response', (err)=>{
        if (err.raw.statusCode === 413) {
          return {tooBig: { originalErrorFromMicrosoft: err }};
        } else {
          return err;
        }
      });

      if (inputs.ensureAck) {
        await deferred;
      } else {
        // FUTURE: take advantage of .background() here instead (when available)
        deferred.exec((err)=>{
          if (err) {
            sails.log.error(
              'Background instruction failed:  Could not deliver email:\n'+
              util.inspect(inputs,{depth:null})+'\n',
              'Error details:\n'+
              util.inspect(err)
            );
          } else {
            sails.log.info(
              'Background instruction complete:  Email sent (or at least queued):\n'+
              util.inspect(inputs,{depth:null})
            );
          }
        });//_∏_
      }//ﬁ
    }//ﬁ

    // All done!
    return {
      loggedInsteadOfSending: dontActuallySend
    };

  }

};
