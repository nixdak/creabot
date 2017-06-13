'use strict';

module.exports = {
  up (queryInterface, { INTEGER }) {
    return queryInterface.addColumn('rounds', 'question_id', {
      type      : INTEGER,
      references: {
        model: 'cards',
        key  : 'id',
      },
    });
  },

  down (queryInterface) {
    return queryInterface.removeColumn('rounds', 'question_id');
  },
};
