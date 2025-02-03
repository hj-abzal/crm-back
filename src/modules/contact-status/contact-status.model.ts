import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import { Contacts } from '../contacts/models/contacts.model';

@Table({ tableName: 'contact_statuses' })
export class ContactStatuses extends Model<ContactStatuses> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'status_id',
  })
  statusId: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name: string;

  @HasMany(() => Contacts)
  contacts: Contacts[];
}
