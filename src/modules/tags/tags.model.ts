import {
  Table,
  Column,
  Model,
  DataType,
  BelongsToMany,
} from 'sequelize-typescript';
import { Contacts } from '../contacts/models/contacts.model';
import { ContactTag } from './contact-tag.model';

@Table({ tableName: 'tags' })
export class Tags extends Model<Tags> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    field: 'tag_id',
  })
  tagId: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  name: string;

  @BelongsToMany(() => Contacts, () => ContactTag)
  contacts: Contacts[];
}
