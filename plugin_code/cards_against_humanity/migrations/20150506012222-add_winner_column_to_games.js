module.exports = {
  up (queryInterface, { INTEGER }) {
    return queryInterface.addColumn('games', 'winner_id', {
      type         : INTEGER,
      references   : 'players',
      referencesKey: 'id',
    });
  },

  down (queryInterface, Sequelize) {
    return queryInterface.removeColumn('games', 'winner_id');
  },
};
