'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.renameColumn('contact_phones', 'deleted_at', 'deletedAt');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.renameColumn('contact_phones', 'deletedAt', 'deleted_at');
  }
};
