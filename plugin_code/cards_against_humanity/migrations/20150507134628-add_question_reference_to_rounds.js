module.exports = {
  up (queryInterface, { INTEGER }) {
    return queryInterface.addColumn('rounds', 'question_id', {
      type         : INTEGER,
      references   : 'cards',
      referencesKey: 'id',
    });
  },

  down (queryInterface, Sequelize) {
    return queryInterface.removeColumn('rounds', 'question_id');
  },
};
