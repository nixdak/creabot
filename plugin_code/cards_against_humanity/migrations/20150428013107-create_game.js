'use strict';

module.exports = {
  up (queryInterface, { INTEGER, DATE }) {
    return queryInterface.createTable('games', {
      id: {
        type         : INTEGER,
        primaryKey   : true,
        autoIncrement: true,
      },
      created_at: {
        type: DATE,
      },
      updated_at: {
        type: DATE,
      },
      ended_at: {
        type: DATE,
      },
    });
  },

  down (queryInterface) {
    return queryInterface.dropTable('games');
  },
};
