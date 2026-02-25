# 🛡️ Security Operations Center (SOC) - Log Management

This project is a centralized log management and monitoring system built for an internship technical assessment. It features a complete data pipeline, real-time alerting, and Role-Based Access Control (RBAC).

## ☁️ Live Cloud Deployment
- **URL:** [https://20.189.73.166](https://20.189.73.166)
- **Note:** The site uses a self-signed TLS certificate via Caddy (`tls internal`). Please click "Advanced" -> "Proceed to unsafe" in your browser to view the dashboard.

## 🚀 Architecture & Tech Stack
- **Log Collector / Pipeline:** Vector (Timber.io)
- **Backend:** NestJS & Prisma ORM
- **Database:** PostgreSQL
- **Frontend / Dashboard:** Next.js, Tailwind CSS, Recharts
- **Reverse Proxy / TLS:** Caddy Server
- **Infrastructure:** Docker Compose (Appliance Mode) & Azure VM (Cloud Mode)

## ✨ Core Features Implemented
1. **Data Ingestion:** Vector receives logs via HTTP source and forwards them to the NestJS backend in batch format.
2. **Dashboard:** Built with Next.js & Recharts. Displays log summaries, severity counts, and a table of recent logs.
3. **Alerting:** A rule engine detects Brute Force attacks (e.g., 3 failed logins within 5 minutes for the same user) and triggers an alert warning in the backend logs.
4. **Security (RBAC):** Multi-tenant architecture. 
   - `Global Admin` can view all logs across all tenants.
   - `Tenant Viewer (demoA)` can only view logs belonging to `demoA`.

---

## 🛠️ How to Run Locally (Appliance Mode)

### Prerequisites
- Docker & Docker Compose

### Setup Steps
1. Clone the repository:
   ```bash
   git clone https://github.com/Chayapon8251/Log-management-intern
   cd log-management-intern
