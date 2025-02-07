import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Tasks } from './tasks.model';

@Table({ tableName: 'task_reassignments' })
export class TaskReassignments extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  reassignmentId: number;

  @ForeignKey(() => Tasks)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  taskId: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  oldManagerId: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  newManagerId: number;

  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW,
  })
  reassignedAt: Date;

  @BelongsTo(() => Tasks)
  task: Tasks;
} 