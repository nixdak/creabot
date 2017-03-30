module.exports = (sequelize, { INTEGER }) => sequelize.define(
  'Round',
  {
    game_id: {
      type      : INTEGER,
      primaryKey: true,
      references: {
        model: 'games',
        key  : 'id',
      },
    },
    winner_id: {
      type      : INTEGER,
      references: {
        model: 'players',
        key  : 'id',
      },
    },
    round_number: {
      type         : INTEGER,
      primaryKey   : true,
      autoIncrement: false,
    },
    question_id: {
      type      : INTEGER,
      references: {
        model: 'cards',
        key  : 'id',
      },
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
