module.exports = function (sequelize, DataTypes) {
  return sequelize.define('Points',
    {
      player_id: {
        type: DataTypes.INTEGER,
        references: 'players',
        referencesKey: 'id',
        primaryKey: true,
        autoIncrement: false
      },
      game_id: {
        type: DataTypes.INTEGER,
        references: 'games',
        referencesKey: 'id',
        primaryKey: true,
        autoIncrement: false
      },
      is_active: {
        type: DataTypes.BOOLEAN
      },
      points: {
        type: DataTypes.INTEGER
      }
    },
    {
      tableName: 'points',
      timestamps: false
    }
  );
}
