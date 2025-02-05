import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Contacts } from './contacts.model';
import { Users } from '../../users/users.model';

@Table({
  tableName: 'contact_reassignments',
  timestamps: false,
})
export class ContactReassignments extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'id',
  })
  id: number;

  @ForeignKey(() => Contacts)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'contact_id',
  })
  contactId: number;

  @ForeignKey(() => Users)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    field: 'old_manager_id',
  })
  oldManagerId: number;

  @ForeignKey(() => Users)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    field: 'new_manager_id',
  })
  newManagerId: number;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
    field: 'reassigned_at',
  })
  reassignedAt: Date;

  @BelongsTo(() => Contacts)
  contact: Contacts;

  @BelongsTo(() => Users, 'old_manager_id')
  oldManager: Users;

  @BelongsTo(() => Users, 'new_manager_id')
  newManager: Users;
} 