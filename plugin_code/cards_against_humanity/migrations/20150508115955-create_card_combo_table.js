'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.createTable('card_combos',
      {
        game_id: {
          type: Sequelize.INTEGER,
          references: 'games',
          referencesKey: 'id',
          primaryKey: true,
          autoIncrement: false
        },
        player_id: {
          type: Sequelize.INTEGER,
          references: 'players',
          referencesKey: 'id',
          primaryKey: true,
          autoIncrement: false
        },
        question_id: {
          type: Sequelize.INTEGER,
          references: 'cards',
          referencesKey: 'id',
          primaryKey: true,
          autoIncrement: false
        },
        answer_ids: {
          type: Sequelize.STRING
        }
      }
    );
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.dropTable('card_combos');
  }
};
