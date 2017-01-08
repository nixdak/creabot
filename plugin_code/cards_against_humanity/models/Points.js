module.exports = (sequelize, { INTEGER, BOOLEAN }) => sequelize.define(
  'Points',
  {
    player_id: {
      type         : INTEGER,
      references   : 'players',
      referencesKey: 'id',
      primaryKey   : true,
      autoIncrement: false,
    },
    game_id: {
      type         : INTEGER,
      references   : 'games',
      referencesKey: 'id',
      primaryKey   : true,
      autoIncrement: false,
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
