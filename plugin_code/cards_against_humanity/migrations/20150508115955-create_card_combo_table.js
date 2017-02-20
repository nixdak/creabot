module.exports = {
  up (queryInterface, { INTEGER, STRING }) {
    return queryInterface.createTable('card_combos', {
      game_id: {
        type         : INTEGER,
        references   : 'games',
        referencesKey: 'id',
        primaryKey   : true,
        autoIncrement: false,
      },
      player_id: {
        type         : INTEGER,
        references   : 'players',
        referencesKey: 'id',
        primaryKey   : true,
        autoIncrement: false,
      },
      question_id: {
        type         : INTEGER,
        references   : 'cards',
        referencesKey: 'id',
        primaryKey   : true,
        autoIncrement: false,
      },
      answer_ids: {
        type: STRING,
      },
    });
  },

  down (queryInterface, Sequelize) {
    return queryInterface.dropTable('card_combos');
  },
};
