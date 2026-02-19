import { Controller, Get, Post, Body, Res, Req, HttpStatus } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('ingest')
  async ingestLog(@Body() payload: any, @Res() res: any) {
    console.log("🔥 [INCOMING LOGS FROM VECTOR]:", JSON.stringify(payload, null, 2));
    
    const logs = Array.isArray(payload) ? payload : [payload];
    
    let ingestedCount = 0;
    for (const logData of logs) {
      if (!logData || Object.keys(logData).length === 0) continue;
      await this.appService.createLog(logData);
      ingestedCount++;
    }

    return res.status(HttpStatus.OK).json({ 
      status: 'success', 
      ingested: ingestedCount 
    });
  }

  @Get('logs')
  async getLogs(@Req() req: any) {
    const role = req.headers['x-role'] || 'admin';
    const tenant = req.headers['x-tenant'];
    return await this.appService.getLogs(role, tenant);
  }
}