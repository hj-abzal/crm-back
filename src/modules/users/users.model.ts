import { Column, DataType, Table, Model } from 'sequelize-typescript';
import { USER_STATUS } from './user-status.enums';

@Table({ tableName: 'users' })
export class Users extends Model<Users> {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @Column({ type: DataType.STRING })
  firstName: string;

  @Column({ type: DataType.STRING })
  lastName: string;

  @Column({ type: DataType.STRING, unique: true })
  email: string;

  @Column({ type: DataType.STRING })
  password: string;

  @Column({
    type: DataType.ENUM({
      values: [USER_STATUS.CREATED, USER_STATUS.VERIFIED],
    }),
  })
  status: USER_STATUS;

  @Column({ type: DataType.STRING(1024), unique: true, field: 'access_token' })
  accessToken: string;

  @Column({ type: DataType.STRING, allowNull: true })
  code: string;
}
