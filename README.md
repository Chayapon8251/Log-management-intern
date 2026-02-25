#  Security Operations Center (SOC) - Log Management

โปรเจกต์นี้คือระบบจัดการและ Monitoring Log แบบรวมศูนย์ (Centralized Log Management) ที่ทำขึ้นสำหรับการทดสอบ Technical Assessment ของการฝึกงานนี้ครับ โดยระบบนี้มีการแจ้งเตือนภัยคุกคามแบบ Real-time มีการทำ CI/CD เบื้องต้นผ่าน Github Action, และ Role-Based Access Control (RBAC)

##  Live Cloud Deployment
- **URL:** [https://20-189-73-166.nip.io/](https://20-189-73-166.nip.io/)
- **หมายเหตุ:** ตัวเว็บใช้ Self-signed TLS certificate ผ่าน Caddy (`tls internal`) อาจต้องคลิก "Advanced" (ขั้นสูง) -> "Proceed to 20-189-73-166.nip.io (unsafe)" ในเบราว์เซอร์เพื่อเข้าดู Dashboard ครับ

## Architecture & Tech Stack
- **Log Collector / Pipeline:** Vector (Timber.io)
- **Backend:** NestJS & Prisma ORM
- **Database:** PostgreSQL
- **Frontend / Dashboard:** Next.js, Tailwind CSS, Recharts
- **Reverse Proxy / TLS:** Caddy Server
- **Infrastructure & CI/CD:** Docker Compose (Appliance Mode), Microsoft Azure VM (Cloud Mode) และ **GitHub Actions**

## Core Features Implemented (ฟีเจอร์หลักที่พัฒนา)
1. **Data Ingestion:** ใช้ Vector ในการรับข้อมูล Log ผ่าน HTTP Endpoint และส่งต่อข้อมูลเป็น Batch ไปยัง NestJS Backend เพื่อลดภาระของเซิร์ฟเวอร์
2. **Dashboard:** ทำหน้า UI ด้วย Next.js และใช้ Recharts แสดงผลสรุปของ Log, กราฟระดับความรุนแรง (Severity), และตาราง Log การเข้าใช้งาน
3. **Real-time Alerting (Webhook):** มี Rule Engine ตรวจจับความผิดปกติ เช่น การโจมตีแบบ Brute Force (ล็อกอินพลาด 3 ครั้งใน 5 นาทีโดย User เดียวกัน) และระบบจะทำการ **ส่งข้อความแจ้งเตือน (Alert)  ไปที่ช่อง Discord แบบ Real-time**
4. **Security (RBAC):** สถาปัตยกรรมรองรับการทำงานแบบ Multi-tenant
   - `Global Admin`: สามารถดู Log ได้ทั้งหมดจากทุก Tenant
   - `Tenant Viewer (demoA)`: ข้อมูลจะถูก Filter ให้เห็นเฉพาะ Log ที่เป็นของ `demoA` เท่านั้น
5. **CI/CD Pipeline (Automated Deployment):** วางระบบ Continuous Deployment ด้วย **GitHub Actions** เมื่อมีการ Push โค้ดชุดใหม่ ระบบจะทำการดึงโค้ดและ Deploy ขึ้นเซิร์ฟเวอร์ Azure ให้อัตโนมัติโดยมีการเก็บ Repository secrets เช่น Webhook URL, SSH Keys ผ่าน GitHub Secrets ครับ

---

## วิธีการรันบนเครื่อง Local (Appliance Mode)

### Prerequisites (สิ่งที่ต้องมี)
- Docker และ Docker Compose

### Setup Steps (ขั้นตอนการติดตั้ง)
1. Clone โค้ดจาก Repository:
   ```bash
   git clone https://github.com/Chayapon8251/Log-management-intern
   cd log-management-intern

## Testing Guide (คู่มือสำหรับการเทสระบบ)
โดยส่วนนี้จะใช้คำสั่ง curl ยิงข้อมูลไปที่ Port8080 หรือตัว Vector ครับ

### 1. ทดสอบระบบรักษาความปลอดภัย (RBAC & Multi-tenancy) เป็นการจำลอง tenant คนอื่นที่ไม่ใช่ demoA เพื่อทดสอบสิทธิ์การมองเห็น log ของ admin กับ demoA
   ```bash
curl -X POST http://localhost:8080/ -H "Content-Type: application/json" -d '{
      "tenant": "demoB",
      "source": "database",
      "event_type": "db_connection_failed",
      "user": "admin_db",
     "severity": 9
   }'
   ```

### 2. ทดลองเทสระบบ Brute force alert โดยตัวระบบจะแสดง Alert ไปที่ Terminal ของ Backend และ channal ใน Discord ผ่าน webhook
   ```bash
curl -X POST http://localhost:8080/ -H "Content-Type: application/json" -d '{
  "tenant": "demoA",
  "source": "api_gateway",
  "event_type": "app_login_failed",
  "user": "hacker_99",
  "severity": 10
}'
   ```
ยิงคำสั่งพร้อมกันอย่างน้อย 3 ครั้งเพื่อรับ Alert



