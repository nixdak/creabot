module.exports = {
  up (queryInterface, { INTEGER, STRING }) {
    return queryInterface.createTable('card_combos', {
      game_id: {
        type         : INTEGER,
        primaryKey   : true,
        autoIncrement: false,
        references   : {
          model: 'games',
          key  : 'id',
        },
      },
      player_id: {
        type         : INTEGER,
        primaryKey   : true,
        autoIncrement: false,
        references   : {
          model: 'players',
          key  : 'id',
        },
      },
      question_id: {
        type         : INTEGER,
        primaryKey   : true,
        autoIncrement: false,
        references   : {
          model: 'cards',
          Key  : 'id',
        },
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
