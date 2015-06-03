'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.addColumn(
      'games',
      'winner_id',
      {
        type: Sequelize.INTEGER,
        references: 'players',
        referencesKey: 'id'
      }
    );
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.removeColumn('games', 'winner_id');
  }
};
