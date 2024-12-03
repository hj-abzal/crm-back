import * as bcrypt from 'bcrypt';

export class CodeUtil {
  static async encryptPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }

  static async checkPassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  static generateRandomCode(len: number) {
    return [...Array(len)].map((_) => this.getRandomInt(9)).join('');
  }

  static getRandomKey = () => {
    return `${this.toAlpha(this.getRandomInt(27))}-${this.getRandomInt(1000)}`;
  };

  static getRandomInt(max: number) {
    return Math.floor(Math.random() * max);
  }

  static toAlpha = (num: number) => {
    const leveller = 64;
    return String.fromCharCode(num + leveller);
  };
}
