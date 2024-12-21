import * as bcrypt from 'bcrypt';

export class CodeUtil {
  static async encryptPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }

  static async checkPassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }
}
