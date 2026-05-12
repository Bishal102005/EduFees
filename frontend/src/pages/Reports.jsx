import { useEffect, useState } from 'react';
import { api } from '../api/api';
import Layout from '../components/Layout';

export default function Reports() {
  const [data, setData] = useState({ batches: [], students: [], fees: [] });

  const load = async () => {
    const batches = await api.getBatches();
    const students = await api.getStudents();
    const fees = await api.getFees();
    setData({ batches, students, fees });
  };
  useEffect(() => { load(); }, []);

  const exportCSV = () => {
    const headers = ['Student', 'Mobile', 'Batch', 'Month', 'Year', 'Amount', 'Status'];
    const rows = data.students.map(s => {
      const fee = data.fees.find(f => f.studentId === s.id);
      const batch = data.batches.find(b => b.id === s.batchId);
      return [s.name, s.mobile, batch?.name || '', fee?.month || '', fee?.year || '', fee?.amount || '', fee?.status || 'pending'];
    });
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'report.csv'; a.click();
  };

  return (
    <Layout title="Reports">
      <button onClick={exportCSV} className="mb-6 px-4 py-2 bg-slate-800 text-white rounded-xl">Export CSV</button>
      <div className="bg-white rounded-2xl border p-6">
        <p className="text-slate-500">Fee reports with export available. Data synced from Supabase / LocalStorage.</p>
      </div>
    </Layout>
  );
}
