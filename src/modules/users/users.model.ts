import { Column, DataType, Table, Model, HasMany } from 'sequelize-typescript';
import { USER_ROLE } from './user-role.enums';
import { Contacts } from '../contacts/models/contacts.model';

@Table({ tableName: 'users' })
export class Users extends Model<Users> {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
    field: 'user_id',
  })
  userId: number;

  @Column({ type: DataType.STRING, unique: true, allowNull: false })
  username: string;

  @Column({ type: DataType.STRING, field: 'first_name', allowNull: false })
  firstName: string;

  @Column({ type: DataType.STRING, field: 'last_name', allowNull: false })
  lastName: string;

  @Column({ type: DataType.STRING, allowNull: false })
  password: string;

  @Column({
    type: DataType.ENUM({
      values: [USER_ROLE.ADMIN, USER_ROLE.MANAGER],
    }),
    allowNull: false,
  })
  role: USER_ROLE;

  @Column({
    type: DataType.STRING(1024),
    unique: true,
    field: 'access_token',
    allowNull: true,
  })
  accessToken: string;

  @HasMany(() => Contacts, { foreignKey: 'managerId' })
  contacts: Contacts[];

  toJSON() {
    const attributes = { ...this.get() };
    delete attributes.password;
    delete attributes.accessToken;
    return attributes;
  }
}
