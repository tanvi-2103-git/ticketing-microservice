import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

export class Password {
  static async toHash(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  static async compare(storedPassword: string, suppliedPassword: string): Promise<boolean> {
    return bcrypt.compare(suppliedPassword, storedPassword);
  }
}