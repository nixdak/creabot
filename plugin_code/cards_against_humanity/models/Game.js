module.exports = (sequelize, { INTEGER, DATE }) => sequelize.define(
  'Game',
  {
    id: {
      type         : INTEGER,
      primaryKey   : true,
      autoIncrement: true,
    },
    ended_at: {
      type: DATE,
    },
    winner_id: {
      type      : INTEGER,
      references: {
        model: 'players',
        key  : 'id',
      },
    },
    num_rounds: {
      type: INTEGER,
    },
  },
  {
    tableName: 'games',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);
