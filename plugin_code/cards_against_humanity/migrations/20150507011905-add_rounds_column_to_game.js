module.exports = {
  up (queryInterface, { INTEGER }) {
    return queryInterface.addColumn('games', 'num_rounds', {
      type: INTEGER,
    });
  },

  down (queryInterface, Sequelize) {
    return queryInterface.removeColumn('games', 'num_rounds');
  },
};
