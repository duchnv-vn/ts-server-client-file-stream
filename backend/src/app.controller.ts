import { Controller, Get, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { Response } from 'express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('download')
  async getHello(@Res() res: Response) {
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Transfer-Encoding', 'chunked');

    const headers = 'id,name,location,value,createdAt,updatedAt\n';
    res.write(headers);

    for (let i = 0; i < 5; i++) {
      const row = `${i},Item ${i}${i}${i},Location ${i}${i}${i},${Math.random()},${new Date().toISOString()},${new Date().toISOString()}\n`;

      await new Promise((resolve) => setTimeout(resolve, 1000));

      res.write(row);
      console.log(`Sent: ${row}`);
    }

    // for await (const chunk of this.appService.generateData()) {
    //   res.write(chunk);
    //   console.log(`Sent: ${chunk}`);
    // }

    return res.send();
  }
}
