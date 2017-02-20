'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.createTable(
      'points',
      {
        player_id: {
          type: Sequelize.INTEGER,
          references: 'players',
          referencesKey: 'id',
          primaryKey: true
        },
        game_id: {
          type: Sequelize.INTEGER,
          references: 'games',
          referencesKey: 'id',
          primaryKey: true
        },
        is_active: {
          type: Sequelize.BOOLEAN
        },
        points: {
          type: Sequelize.INTEGER
        }
      }
    )
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.dropTable('points');
  }
};
