// backend/src/app.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateLogDto } from './create-log.dto';

@Injectable()
export class AppService {
  private prisma = new PrismaClient();

  getHello(): string {
    return 'Log Management Backend is Running!';
  }

  async createLog(data: CreateLogDto) {
    const timestamp = data.timestamp ? new Date(data.timestamp) : new Date();
    const eventType = data.event_type || 'unknown';
    const user = data.user || 'unknown_user';

    // 1. บันทึก Log ลง Database ตามปกติ
    const newLog = await this.prisma.log.create({
      data: {
        timestamp: timestamp,
        tenant: data.tenant || 'default',
        source: data.source || 'api',
        eventType: eventType,
        severity: data.severity || 1,
        action: data.action,
        srcIp: data.src_ip,
        dstIp: data.dst_ip,
        user: user,
        raw: data.raw || JSON.stringify(data),
      },
    });

    // ==========================================
    // 2. ALERT RULE: ตรวจจับ Brute Force Login
    // ==========================================
    if (eventType === 'app_login_failed' || eventType === 'login_failed') {
      // คำนวณเวลาย้อนหลัง 5 นาที
      const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000);

      // นับจำนวนครั้งที่ user คนนี้ login พลาดในช่วง 5 นาทีที่ผ่านมา
      const failedCount = await this.prisma.log.count({
        where: {
          user: user,
          eventType: eventType,
          timestamp: { gte: fiveMinsAgo },
        },
      });

      // ถ้าพลาด 3 ครั้งขึ้นไป -> TRIGGER ALERT!
      if (failedCount >= 3) {
        this.triggerAlert(user, failedCount);
      }
    }

    return newLog;
  }

  // ฟังก์ชันจำลองการส่ง Webhook / Email หรือแจ้งเตือน
  private triggerAlert(user: string, count: number) {
    const alertMessage = `🚨 [ALERT] ตรวจพบการพยายามเข้าสู่ระบบผิดปกติ! User: '${user}' ล็อกอินล้มเหลว ${count} ครั้ง ในช่วง 5 นาทีที่ผ่านมา`;
    
    // พิมพ์โชว์ใน Console (จำลองการยิง Webhook)
    console.warn('\n================================================');
    console.warn(alertMessage);
    console.warn('================================================\n');

    // (ถ้านี่คืองานจริง เราจะใช้ axios.post() ยิงเข้า Discord/Slack webhook ตรงนี้ได้เลย)
  }

  async getLogs(role?: string, tenant?: string) {
    // ถ้าเป็น viewer ให้สร้างเงื่อนไขกรอง (Where clause) ดูได้แค่ tenant ของตัวเอง
    const whereCondition = (role === 'viewer' && tenant) ? { tenant: tenant } : {};

    return await this.prisma.log.findMany({
      where: whereCondition,
      orderBy: { timestamp: 'desc' },
      take: 50, // ดึงมา 50 รายการล่าสุด
    });
  }
}