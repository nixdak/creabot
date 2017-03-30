module.exports = {
  up (queryInterface, { INTEGER }) {
    return queryInterface.createTable('rounds', {
      game_id: {
        type      : INTEGER,
        primaryKey: true,
        references: {
          model: 'games',
          key  : 'id',
        },
      },
      round_number: {
        type         : INTEGER,
        primaryKey   : true,
        autoIncrement: false,
      },
      winner_id: {
        type      : INTEGER,
        references: {
          model: 'players',
          key  : 'id',
        },
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
