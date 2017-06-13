'use strict';

module.exports = {
  up (queryInterface, { INTEGER }) {
    return queryInterface.addColumn('games', 'num_rounds', {
      type: INTEGER,
    });
  },

  down (queryInterface) {
    return queryInterface.removeColumn('games', 'num_rounds');
  },
};
