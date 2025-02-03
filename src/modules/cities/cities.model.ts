import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import { Contacts } from '../contacts/models/contacts.model';

@Table({ tableName: 'cities', timestamps: true, paranoid: true })
export class Cities extends Model<Cities> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'city_id',
  })
  cityId: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name: string;

  @HasMany(() => Contacts)
  contacts: Contacts[];
}
