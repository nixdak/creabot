'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.createTable('cards',
      {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        text: {
          type: 'VARCHAR(512)'
        },
        question: {
            type: Sequelize.BOOLEAN
        },
        times_played: {
          type: Sequelize.INTEGER
        }
      }
    );
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.dropTable('cards');
  }
};
