module.exports = function (sequelize, DataTypes) {
  return sequelize.define('Player',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      nick: {
        type: DataTypes.STRING
      },
      last_game_id: {
        type: DataTypes.INTEGER
      }
    },
    {
      tableName: 'players',
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  );
};
