import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Contacts } from '../contacts/models/contacts.model';
import { Users } from '../users/users.model';

@Table({ tableName: 'comments' })
export class Comments extends Model<Comments> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'comment_id',
  })
  commentId: number;

  @Column({ type: DataType.STRING, allowNull: false })
  text: string;

  @ForeignKey(() => Contacts)
  @Column({ type: DataType.INTEGER, allowNull: true, field: 'contact_id' })
  contactId: number;

  @BelongsTo(() => Contacts)
  contact: Contacts;

  @ForeignKey(() => Users)
  @Column({ type: DataType.INTEGER, allowNull: false, field: 'manager_id' })
  managerId: number;

  @BelongsTo(() => Users)
  manager: Users;
}
