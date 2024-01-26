import { Injectable } from '@nestjs/common';
import { db } from './config/database';
import { sql } from 'drizzle-orm';

@Injectable()
export class AppService {
  async getHello() {
    const [version] = await db.execute(sql`select version()`);
    return { version, message: 'Api is running fine' };
  }
}
