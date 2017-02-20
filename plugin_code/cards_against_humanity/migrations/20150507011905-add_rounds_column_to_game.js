'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.addColumn('games',
      'num_rounds',
      {
        type: Sequelize.INTEGER
      }
    );
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.removeColumn('games', 'num_rounds');
  }
};
