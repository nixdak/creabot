module.exports = {
  up (queryInterface, { INTEGER, STRING, DATE }) {
    return queryInterface.createTable('players', {
      id: {
        type         : INTEGER,
        primaryKey   : true,
        autoIncrement: true,
      },
      nick: {
        type: STRING,
      },
      created_at: {
        type: DATE,
      },
      updated_at: {
        type: DATE,
      },
      last_game_id: {
        type      : INTEGER,
        references: {
          model: 'games',
          key  : 'id',
        },
      },
    });
  },

  down (queryInterface, Sequelize) {
    return queryInterface.dropTable('players');
  },
};
