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
  private async triggerAlert(user: string, count: number) {
    const alertMessage = `🚨 **[URGENT ALERT]** 🚨\nตรวจพบการพยายามเข้าสู่ระบบผิดปกติ!\n**User:** \`${user}\`\n**เหตุการณ์:** ล็อกอินล้มเหลว ${count} ครั้ง ในช่วง 5 นาทีที่ผ่านมา`;
    
    // พิมพ์โชว์ใน Console เผื่อไว้ดูเอง
    console.warn('\n================================================');
    console.warn(alertMessage);
    console.warn('================================================\n');

    // เอา Webhook URL ของ Discord ที่ก๊อปปี้มา วางแทนที่ในเครื่องหมายคำพูดด้านล่างนี้ครับ
    const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1476196992513478728/XFYL8XUVKOzeYaXSZ5Qsl4ZsvWyp0aWH4AueKGwhgtmn4Hgkvutbr1MlsZW2vLx9tyeG'; 

    try {
      // ใช้คำสั่ง fetch ยิงข้อมูลไปที่ Discord
      await fetch(DISCORD_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          content: alertMessage,
          username: "SOC Security Bot", // ชื่อบอทที่จะโชว์ใน Discord
          avatar_url: "https://cdn-icons-png.flaticon.com/512/2092/2092663.png" // รูปโปรไฟล์บอทเท่ๆ
        }),
      });
      console.log('✅ Webhook sent successfully!');
    } catch (error) {
      console.error('❌ Error sending webhook:', error);
    }
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