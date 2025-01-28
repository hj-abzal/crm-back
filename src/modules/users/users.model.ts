import { Column, DataType, Table, Model } from 'sequelize-typescript';
import { USER_ROLE } from './user-role.enums';

@Table({
  tableName: 'users',
  paranoid: true,
  timestamps: true,
})
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

  // @HasMany(() => Contacts, { foreignKey: 'managerId' })
  // contacts: Contacts[];
  //
  // @HasMany(() => Comments, { foreignKey: 'managerId' })
  // comments: Comments[];
  //
  // @HasMany(() => Tasks, { foreignKey: 'managerId' })
  // tasks: Tasks[];

  toJSON() {
    const attributes = { ...this.get() };
    delete attributes.password;
    return attributes;
  }
}
