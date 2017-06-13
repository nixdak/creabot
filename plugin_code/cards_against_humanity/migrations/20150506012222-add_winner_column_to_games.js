'use strict';

module.exports = {
  up (queryInterface, { INTEGER }) {
    return queryInterface.addColumn('games', 'winner_id', {
      type      : INTEGER,
      references: {
        model: 'players',
        key  : 'id',
      },
    });
  },

  down (queryInterface) {
    return queryInterface.removeColumn('games', 'winner_id');
  },
};
