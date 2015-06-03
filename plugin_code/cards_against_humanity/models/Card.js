module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Card',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      text: {
        type: DataTypes.STRING(512)
      },
      question: {
        type: DataTypes.BOOLEAN
      },
      times_played: {
        type: DataTypes.INTEGER
      }
    },
    {
      tableName: 'cards',
      timestamps: false
    }
  );
};
