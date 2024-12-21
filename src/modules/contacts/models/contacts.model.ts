import {
  Column,
  DataType,
  Table,
  Model,
  ForeignKey,
  BelongsTo,
  HasMany,
  BelongsToMany,
} from 'sequelize-typescript';
import { Users } from '../../users/users.model';
import { ContactPhones } from './contact-phones.model';
import { ContactTag } from '../../tags/contact-tag.model';
import { Tags } from '../../tags/tags.model';
import { Cities } from '../../cities/cities.model';
import { ContactSources } from '../../contact-source/contact-source.model';
import { Comments } from '../../comments/comments.model';
import { Events } from '../../events/events.model';
import { Tasks } from '../../tasks/tasks.model';

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
  fullName: string;

  @Column({
    type: DataType.DATE,
    field: 'birth_date',
    allowNull: true,
  })
  birthDate: Date;

  @ForeignKey(() => Users)
  @Column({
    type: DataType.INTEGER,
    field: 'manager_id',
    allowNull: true,
  })
  managerId: number;

  @BelongsTo(() => Users)
  manager: Users;

  @ForeignKey(() => Cities)
  @Column({
    type: DataType.INTEGER,
    field: 'city_id',
    onDelete: 'SET NULL',
    allowNull: true,
  })
  cityId: number;

  @BelongsTo(() => Cities)
  city: Cities;

  @ForeignKey(() => ContactSources)
  @Column({
    type: DataType.INTEGER,
    field: 'source_id',
    onDelete: 'SET NULL',
    allowNull: true,
  })
  sourceId: number;

  @BelongsTo(() => ContactSources)
  source: ContactSources;

  @HasMany(() => ContactPhones, {
    foreignKey: 'contactId',
    onDelete: 'CASCADE',
  })
  contactPhones: ContactPhones[];

  @BelongsToMany(() => Tags, () => ContactTag)
  tags: Tags[];

  @HasMany(() => Comments, {
    onDelete: 'CASCADE',
  })
  comments: Comments[];

  @HasMany(() => Events, {
    onDelete: 'CASCADE',
  })
  events: Events[];

  @HasMany(() => Tasks)
  tasks: Tasks[];
}
