'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.addColumn(
      'rounds',
      'question_id',
      {
        type: Sequelize.INTEGER,
        references: 'cards',
        referencesKey: 'id'
      }
    );
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.removeColumn('rounds', 'question_id');
  }
};
