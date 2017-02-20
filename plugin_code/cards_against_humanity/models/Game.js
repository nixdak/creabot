module.exports = function (sequelize, DataTypes) {
  return sequelize.define('Game',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      ended_at: {
        type: DataTypes.DATE
      },
      winner_id: {
        type: DataTypes.INTEGER,
        references: 'players',
        referencesKey: 'id'
      },
      num_rounds: {
        type: DataTypes.INTEGER
      }
    },
    {
      tableName: 'games',
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  );
};
