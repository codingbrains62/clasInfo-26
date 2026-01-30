/**
  HistoricalEvent.js
 **/

module.exports = {
  attributes: {
    description: {type: 'string', required: true, description: 'A longer, full-sentence description of the event that occured.' },
    actorId: { type: 'number', description: 'This is not an association-- it is another copy of the user id,  in case the user is deleted.' },
    actorType: { type: 'string', description: 'This is to point the user id to the proper table', isIn: [ 'Client', 'User', 'Other' ], },
    actorDisplayName: { type: 'string', required: true },
    category: { type: 'string', description: 'A special, generic category for this kind of historical event.',
             isIn: [ 'Login', 'Delivery', 'Invoice', 'Commission', 'Other' ], defaultsTo: 'Other', },

  },

};

