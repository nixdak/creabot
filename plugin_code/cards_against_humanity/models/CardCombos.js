module.exports = (sequelize, { INTEGER, STRING }) => sequelize.define(
  'CardCombo',
  {
    game_id: {
      type         : INTEGER,
      references   : 'games',
      referencesKey: 'id',
      primaryKey   : true,
      autoIncrement: false,
    },
    player_id: {
      type         : INTEGER,
      references   : 'player',
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
  },
  {
    tableName : 'card_combos',
    timestamps: false,
  }
);
