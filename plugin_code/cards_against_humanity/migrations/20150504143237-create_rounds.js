'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.createTable(
      'rounds',
      {
        game_id: {
          type: Sequelize.INTEGER,
          references: 'games',
          referencesKey: 'id',
          primaryKey: true
        },
        round_number: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: false
        },
        winner_id: {
          type: Sequelize.INTEGER,
          references: 'players',
          referencesKey: 'id'
        },
        num_active_players: {
          type: Sequelize.INTEGER
        },
        total_players: {
          type: Sequelize.INTEGER
        }
      }
    )
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.dropTable('rounds');
  }
};
