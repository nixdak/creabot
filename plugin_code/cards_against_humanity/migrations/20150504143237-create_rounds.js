module.exports = {
  up (queryInterface, { INTEGER }) {
    return queryInterface.createTable('rounds', {
      game_id: {
        type         : INTEGER,
        references   : 'games',
        referencesKey: 'id',
        primaryKey   : true,
      },
      round_number: {
        type         : INTEGER,
        primaryKey   : true,
        autoIncrement: false,
      },
      winner_id: {
        type         : INTEGER,
        references   : 'players',
        referencesKey: 'id',
      },
      num_active_players: {
        type: INTEGER,
      },
      total_players: {
        type: INTEGER,
      },
    });
  },

  down (queryInterface, Sequelize) {
    return queryInterface.dropTable('rounds');
  },
};
