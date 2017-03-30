module.exports = {
  up (queryInterface, { INTEGER, BOOLEAN }) {
    return queryInterface.createTable('points', {
      player_id: {
        type      : INTEGER,
        primaryKey: true,
        references: {
          model: 'players',
          key  : 'id',
        },
      },
      game_id: {
        type      : INTEGER,
        primaryKey: true,
        references: {
          model: 'games',
          key  : 'id',
        },
      },
      is_active: {
        type: BOOLEAN,
      },
      points: {
        type: INTEGER,
      },
    });
  },

  down (queryInterface, Sequelize) {
    return queryInterface.dropTable('points');
  },
};
