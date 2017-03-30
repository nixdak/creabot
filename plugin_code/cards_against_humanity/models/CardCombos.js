module.exports = (sequelize, { INTEGER, STRING }) => sequelize.define(
  'CardCombo',
  {
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
        model: 'player',
        key  : 'id',
      },
    },
    question_id: {
      type         : INTEGER,
      primaryKey   : true,
      autoIncrement: false,
      references   : {
        model: 'cards',
        key  : 'id',
      },
    },
    answer_ids: {
      type: STRING,
    },
  },
  {
    tableName : 'card_combos',
    timestamps: false,
  }
);
