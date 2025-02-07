'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('tags', 'tags_name_key'); 
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addConstraint('tags', {
      fields: ['name'],
      type: 'unique',
      name: 'tags_name_key'
    });
  }
};
