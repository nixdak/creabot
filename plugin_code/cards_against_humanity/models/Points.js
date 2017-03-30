module.exports = (sequelize, { INTEGER, BOOLEAN }) => sequelize.define(
  'Points',
  {
    player_id: {
      type         : INTEGER,
      primaryKey   : true,
      autoIncrement: false,
      references   : {
        model: 'players',
        key  : 'id',
      },
    },
    game_id: {
      type         : INTEGER,
      primaryKey   : true,
      autoIncrement: false,
      references   : {
        model: 'games',
        key  : 'id',
      },
    },
    is_active: {
      type: BOOLEAN,
    },
    points: {
      type: INTEGER,
    },
  },
  {
    tableName : 'points',
    timestamps: false,
  }
);
