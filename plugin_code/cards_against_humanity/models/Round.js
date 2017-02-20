module.exports = (sequelize, { INTEGER }) => sequelize.define(
  'Round',
  {
    game_id: {
      type         : INTEGER,
      references   : 'games',
      referencesKey: 'id',
      primaryKey   : true,
    },
    winner_id: {
      type         : INTEGER,
      references   : 'players',
      referencesKey: 'id',
    },
    round_number: {
      type         : INTEGER,
      primaryKey   : true,
      autoIncrement: false,
    },
    question_id: {
      type         : INTEGER,
      references   : 'cards',
      referencesKey: 'id',
    },
    num_active_players: {
      type: INTEGER,
    },
    total_players: {
      type: INTEGER,
    },
  },
  {
    tableName : 'rounds',
    timestamps: false,
  }
);
