import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({
  tableName: 'task_types',
  paranoid: false,
})
export class TaskType extends Model<TaskType> {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name: string;
} 