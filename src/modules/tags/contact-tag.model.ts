import {
  Table,
  Column,
  Model,
  ForeignKey,
  DataType,
} from 'sequelize-typescript';
import { Contacts } from '../contacts/models/contacts.model';
import { Tags } from './tags.model';

@Table({ tableName: 'contact_tag' })
export class ContactTag extends Model<ContactTag> {
  @ForeignKey(() => Contacts)
  @Column({ type: DataType.INTEGER, allowNull: false, field: 'contact_id' })
  contactId: number;

  @ForeignKey(() => Tags)
  @Column({ type: DataType.INTEGER, allowNull: false, field: 'tag_id' })
  tagId: number;
}
