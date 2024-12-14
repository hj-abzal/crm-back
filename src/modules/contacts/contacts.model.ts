import {
  Column,
  DataType,
  Table,
  Model,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Users } from '../users/users.model';

@Table({ tableName: 'contacts' })
export class Contacts extends Model<Contacts> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'contact_id',
  })
  readonly contactId: number;

  @Column({
    type: DataType.STRING,
    field: 'full_name',
    allowNull: false,
  })
  readonly fullName: string;

  @ForeignKey(() => Users)
  @Column({
    type: DataType.INTEGER,
    field: 'manager_id',
    allowNull: true,
  })
  readonly managerId: number;

  @BelongsTo(() => Users)
  manager: Users;
}
