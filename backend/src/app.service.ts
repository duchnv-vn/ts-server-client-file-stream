import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  async *generateData() {
    for (let i = 0; i < 30; i++) {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      yield `${i},Item ${i}${i}${i},Location ${i}${i}${i},${Math.random()},${new Date().toISOString()},${new Date().toISOString()}`;
    }
  }
}
