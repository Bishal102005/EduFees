import { useEffect, useState } from 'react';
import { api } from '../api/api';
import { BookOpen, Users, Check, AlertCircle } from 'lucide-react';
import Layout from '../components/Layout';

export default function Dashboard() {
  const [data, setData] = useState({ batches: [], students: [], fees: [], stats: { totalBatches: 0, totalStudents: 0, totalCollected: 0, totalPending: 0 } });

  const loadData = async () => {
    const batches = await api.getBatches();
    const students = await api.getStudents();
    const fees = await api.getFees();
    const totalCollected = fees.filter(r => r.status === 'paid').reduce((sum, r) => sum + r.amount, 0);
    const totalPending = fees.filter(r => r.status !== 'paid').reduce((sum, r) => sum + r.amount, 0);
    setData({ batches, students, fees, stats: { totalBatches: batches.length, totalStudents: students.length, totalCollected, totalPending } });
  };

  useEffect(() => { loadData(); }, []);

  const recentStudents = [...data.students].sort((a, b) => new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime()).slice(0, 5);
  const pendingFees = data.fees.filter(f => f.status !== 'paid').slice(0, 5);

  return (
    <Layout title="Dashboard" subtitle="Fees collection overview">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-6">
        <div className="bg-white rounded-2xl border p-5"><BookOpen className="h-5 w-5 text-blue-600 mb-2" /><p className="text-2xl font-black">{data.stats.totalBatches}</p><p className="text-sm text-slate-500">Batches</p></div>
        <div className="bg-white rounded-2xl border p-5"><Users className="h-5 w-5 text-emerald-600 mb-2" /><p className="text-2xl font-black">{data.stats.totalStudents}</p><p className="text-sm text-slate-500">Students</p></div>
        <div className="bg-white rounded-2xl border p-5"><Check className="h-5 w-5 text-green-600 mb-2" /><p className="text-2xl font-black">₹{data.stats.totalCollected}</p><p className="text-sm text-slate-500">Collected</p></div>
        <div className="bg-white rounded-2xl border p-5"><AlertCircle className="h-5 w-5 text-amber-600 mb-2" /><p className="text-2xl font-black">₹{data.stats.totalPending}</p><p className="text-sm text-slate-500">Pending</p></div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="bg-white rounded-2xl border p-6">
          <h3 className="font-bold mb-4">Recent Students</h3>
          {recentStudents.length === 0 ? <p className="text-slate-400">No students yet.</p> : recentStudents.map(s => (
            <div key={s.id} className="flex items-center gap-3 py-2 border-b last:border-0"><div className="w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center text-sm font-bold">{s.name[0]}</div><div><p className="font-medium">{s.name}</p><p className="text-xs text-slate-500">{s.mobile}</p></div></div>
          ))}
        </div>
        <div className="bg-white rounded-2xl border p-6">
          <h3 className="font-bold mb-4">Pending Fees</h3>
          {pendingFees.length === 0 ? <p className="text-slate-400">All fees collected!</p> : pendingFees.map(f => (
            <div key={f.id} className="flex justify-between py-2 border-b last:border-0"><span>{f.month} {f.year}</span><span className="font-bold text-amber-600">₹{f.amount}</span></div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
