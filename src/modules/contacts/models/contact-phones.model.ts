import {
  AfterBulkCreate,
  AfterBulkDestroy,
  AfterBulkUpdate,
  AfterCreate,
  AfterDestroy,
  AfterUpdate,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Contacts } from './contacts.model';

@Table({ tableName: 'contact_phones' })
export class ContactPhones extends Model<ContactPhones> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'phone_id',
  })
  phoneId: number;

  @ForeignKey(() => Contacts)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'contact_id',
  })
  contactId: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    field: 'phone_number',
  })
  phoneNumber: string;

  @BelongsTo(() => Contacts)
  contact: Contacts;
}
