import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Contacts } from '../contacts/models/contacts.model';
import { TASK_STATUS } from './task-status.enum';
import { Users } from '../users/users.model';

@Table({ tableName: 'tasks', timestamps: true, paranoid: true })
export class Tasks extends Model<Tasks> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'task_id',
  })
  taskId: number;

  @Column({ type: DataType.STRING, allowNull: false })
  title: string;

  @Column({ type: DataType.STRING, allowNull: true })
  description: string;

  @Column({ type: DataType.STRING, allowNull: true })
  result: string;

  @Column({ type: DataType.DATE, allowNull: true, field: 'due_date' })
  dueDate: Date;

  @Column({
    type: DataType.ENUM({
      values: [
        TASK_STATUS.TODO,
        TASK_STATUS.BLOCKED,
        TASK_STATUS.IN_PROGRESS,
        TASK_STATUS.DONE,
      ],
    }),
    allowNull: false,
  })
  status: TASK_STATUS;

  @ForeignKey(() => Contacts)
  @Column({ type: DataType.INTEGER, allowNull: false, field: 'contact_id' })
  contactId: number;

  @BelongsTo(() => Contacts)
  contact: Contacts;

  @ForeignKey(() => Users)
  @Column({ type: DataType.INTEGER, allowNull: false, field: 'manager_id' })
  managerId: number;

  @BelongsTo(() => Users)
  manager: Users;
}
