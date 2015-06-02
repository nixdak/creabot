module.exports = function (sequelize, DataTypes) {
  return sequelize.define('CardCombo',
    {
      game_id: {
        type: DataTypes.INTEGER,
        references: 'games',
        referencesKey: 'id',
        primaryKey: true,
        autoIncrement: false
      },
      player_id: {
        type: DataTypes.INTEGER,
        references: 'player',
        referencesKey: 'id',
        primaryKey: true,
        autoIncrement: false
      },
      question_id: {
        type: DataTypes.INTEGER,
        references: 'cards',
        referencesKey: 'id',
        primaryKey: true,
        autoIncrement: false
      },
      answer_ids: {
        type: DataTypes.STRING
      },
    },
    {
      tableName: 'card_combos',
      timestamps: false
    }
  );
};
