module.exports = (sequelize, { INTEGER, STRING }) => sequelize.define(
  'Player',
  {
    id: {
      type         : INTEGER,
      primaryKey   : true,
      autoIncrement: true,
    },
    nick: {
      type: STRING,
    },
    last_game_id: {
      type: INTEGER,
    },
  },
  {
    tableName: 'players',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);
