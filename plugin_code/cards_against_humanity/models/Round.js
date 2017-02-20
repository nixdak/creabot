module.exports = function (sequelize, DataTypes) {
  return sequelize.define('Round',
    {
      game_id: {
        type: DataTypes.INTEGER,
        references: 'games',
        referencesKey: 'id',
        primaryKey: true
      },
      winner_id: {
        type: DataTypes.INTEGER,
        references: 'players',
        referencesKey: 'id'
      },
      round_number: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: false
      },
      question_id: {
        type: DataTypes.INTEGER,
        references: 'cards',
        referencesKey: 'id',
      },
      num_active_players: {
        type: DataTypes.INTEGER
      },
      total_players: {
        type: DataTypes.INTEGER
      }
    },
    {
      tableName: 'rounds',
      timestamps: false
    }
  );
};
