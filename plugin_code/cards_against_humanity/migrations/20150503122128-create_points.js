module.exports = {
  up (queryInterface, { INTEGER, BOOLEAN }) {
    return queryInterface.createTable('points', {
      player_id: {
        type         : INTEGER,
        references   : 'players',
        referencesKey: 'id',
        primaryKey   : true,
      },
      game_id: {
        type         : INTEGER,
        references   : 'games',
        referencesKey: 'id',
        primaryKey   : true,
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
