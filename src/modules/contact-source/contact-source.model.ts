import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import { Contacts } from '../contacts/models/contacts.model';

@Table({ tableName: 'contact_sources', timestamps: true, paranoid: true })
export class ContactSources extends Model<ContactSources> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'source_id',
  })
  sourceId: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name: string;

  @HasMany(() => Contacts)
  contacts: Contacts[];
}
