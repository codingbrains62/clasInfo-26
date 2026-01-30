/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes tell Sails what to do each time it receives a request.
 *
 * For more information on configuring custom routes, check out:
 * https://sailsjs.com/anatomy/config/routes-js
 */

module.exports.routes = {

'POST /api/v1/add_user': { action: 'client/add-client-user' },
'POST /api/v1/edit_user': { action: 'client/update-client-user' },
'POST /api/v1/login': { action: 'client/validate-login' },

};
