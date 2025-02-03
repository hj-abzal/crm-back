import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Contacts } from '../contacts/models/contacts.model';

@Table({ tableName: 'events', timestamps: true, paranoid: true })
export class Events extends Model<Events> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'event_id',
  })
  eventId: number;

  @Column({ type: DataType.STRING, allowNull: false })
  text: string;

  @ForeignKey(() => Contacts)
  @Column({ type: DataType.INTEGER, allowNull: true, field: 'contact_id' })
  contactId: number;

  @BelongsTo(() => Contacts)
  contact: Contacts;
}
