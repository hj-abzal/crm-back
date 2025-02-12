'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // First add the column as nullable
    await queryInterface.addColumn('tasks', 'created_by_manager_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'user_id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    });

    // Update existing records to use manager_id as created_by_manager_id
    await queryInterface.sequelize.query(`
      UPDATE tasks 
      SET created_by_manager_id = manager_id 
      WHERE created_by_manager_id IS NULL;
    `);

    // Now make the column not nullable
    await queryInterface.changeColumn('tasks', 'created_by_manager_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'user_id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('tasks', 'created_by_manager_id');
  }
};
