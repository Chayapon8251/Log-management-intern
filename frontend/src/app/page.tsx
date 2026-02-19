"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { format } from "date-fns";
import { Activity, ShieldAlert, Server, Users, UserCircle } from "lucide-react";

export default function Dashboard() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // สร้าง State สำหรับระบบ Auth (Mock)
  const [currentUser, setCurrentUser] = useState({ role: 'admin', tenant: 'all' });

  // ฟังก์ชันดึงข้อมูลจาก API Backend (แนบ Header ไปด้วย)
  const fetchLogs = async () => {
    try {
      setLoading(true); // ให้มันโชว์ Loading ตอนกด Refresh จะได้ดูมีอะไรขยับ
      const res = await fetch("http://localhost:3000/logs", {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-role': currentUser.role,
          'x-tenant': currentUser.tenant,
        },
        cache: 'no-store' // <--- บรรทัดนี้คือพระเอก! สั่งไม่ให้ Next.js จำข้อมูลเก่า
      }); 
      const data = await res.json();
      setLogs(data);
    } catch (error) {
      console.error("Error fetching logs:", error);
    } finally {
      setLoading(false);
    }
  };

  // ดึงข้อมูลใหม่ทุกครั้งที่ currentUser เปลี่ยนแปลง
  useEffect(() => {
    fetchLogs();
  }, [currentUser]);

  // ฟังก์ชันคำนวณกราฟ
  const eventTypeStats = logs.reduce((acc: any, log: any) => {
    const type = log.eventType || "unknown";
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.keys(eventTypeStats).map((key) => ({
    name: key,
    count: eventTypeStats[key],
  }));

  if (loading) return <div className="p-10 text-center text-xl">Loading Dashboard...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-8 text-slate-800">
      <div className="max-w-7xl mx-auto">
        
        {/* Header & Auth Switcher */}
        <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Security Operations Center</h1>
            <p className="text-slate-500">Log Management Dashboard</p>
          </div>
          
          {/* ส่วนสลับ User */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm bg-slate-100 p-2 rounded-lg">
              <UserCircle size={20} className="text-slate-500" />
              <select 
                className="bg-transparent border-none font-semibold text-slate-700 outline-none cursor-pointer"
                value={currentUser.role}
                onChange={(e) => {
                  const role = e.target.value;
                  // ถ้าเป็น admin ให้ดูได้หมด ถ้าเป็น viewer ให้ล็อคเป็น demoA
                  setCurrentUser({ role: role, tenant: role === 'admin' ? 'all' : 'demoA' });
                }}
              >
                <option value="admin">Global Admin (View All)</option>
                <option value="viewer">Tenant Viewer (demoA only)</option>
              </select>
            </div>
            
            <button 
              onClick={fetchLogs}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow transition"
            >
              Refresh Data
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-lg"><Activity size={24} /></div>
            <div>
              <p className="text-sm text-slate-500">Total Logs</p>
              <p className="text-2xl font-bold">{logs.length}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="p-3 bg-red-100 text-red-600 rounded-lg"><ShieldAlert size={24} /></div>
            <div>
              <p className="text-sm text-slate-500">High Severity (&gt;7)</p>
              <p className="text-2xl font-bold">
                {logs.filter(l => l.severity >= 7).length}
              </p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="p-3 bg-green-100 text-green-600 rounded-lg"><Server size={24} /></div>
            <div>
              <p className="text-sm text-slate-500">Sources</p>
              <p className="text-2xl font-bold">
                {new Set(logs.map(l => l.source)).size}
              </p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="p-3 bg-purple-100 text-purple-600 rounded-lg"><Users size={24} /></div>
            <div>
              <p className="text-sm text-slate-500">Tenants</p>
              <p className="text-2xl font-bold">
                {new Set(logs.map(l => l.tenant)).size}
              </p>
            </div>
          </div>
        </div>

        {/* Chart Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 mb-8">
          <h2 className="text-lg font-semibold mb-6">Events by Type</h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip cursor={{fill: '#f1f5f9'}} />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Logs Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="text-lg font-semibold">Recent Logs</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-6 py-3 font-medium">Timestamp</th>
                  <th className="px-6 py-3 font-medium">Tenant</th>
                  <th className="px-6 py-3 font-medium">Source</th>
                  <th className="px-6 py-3 font-medium">Event Type</th>
                  <th className="px-6 py-3 font-medium">Severity</th>
                  <th className="px-6 py-3 font-medium">Message/Raw</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                      {format(new Date(log.timestamp), "dd MMM yyyy, HH:mm:ss")}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-700">{log.tenant}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-slate-100 rounded-md text-xs">{log.source}</span>
                    </td>
                    <td className="px-6 py-4">{log.eventType}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        log.severity >= 7 ? 'bg-red-100 text-red-700' :
                        log.severity >= 4 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {log.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4 truncate max-w-xs" title={log.raw}>
                      {log.raw}
                    </td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                      No logs found. Try sending some data!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}