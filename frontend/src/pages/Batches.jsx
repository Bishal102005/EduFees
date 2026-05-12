import { useEffect, useState } from 'react';
import { api } from '../api/api';
import { Plus, Edit3, Trash2 } from 'lucide-react';
import Layout from '../components/Layout';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const emptyBatchForm = {
  name: '',
  subject: '',
  schedule: '',
  monthlyFee: '',
  startMonth: MONTHS[new Date().getMonth()],
  startYear: String(new Date().getFullYear()),
};

export default function Batches() {
  const [batches, setBatches] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyBatchForm);
  const [editingId, setEditingId] = useState(null);

  const load = async () => setBatches(await api.getBatches());
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    const data = {
      ...form,
      monthlyFee: Number(form.monthlyFee),
      startYear: Number(form.startYear),
      id: editingId || Date.now().toString(),
    };
    if (editingId) await api.updateBatch(editingId, data);
    else await api.addBatch(data);
    setShowForm(false); setForm(emptyBatchForm); setEditingId(null); load();
  };

  const edit = (b) => {
    setEditingId(b.id);
    setForm({
      name: b.name,
      subject: b.subject,
      schedule: b.schedule,
      monthlyFee: String(b.monthlyFee),
      startMonth: b.startMonth || MONTHS[new Date().getMonth()],
      startYear: String(b.startYear || new Date().getFullYear()),
    });
    setShowForm(true);
  };
  const del = async (id) => { if (confirm('Delete batch?')) { await api.deleteBatch(id); load(); } };

  return (
    <Layout title="Batches">
      <div className="flex justify-between mb-6">
        <h1 className="text-3xl font-black">Batches</h1>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl"><Plus className="h-4 w-4" /> New Batch</button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="bg-white p-6 rounded-2xl border mb-6 grid md:grid-cols-2 gap-4">
          <input placeholder="Batch Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="border p-3 rounded-xl" required />
          <input placeholder="Subject" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} className="border p-3 rounded-xl" required />
          <input placeholder="Schedule" value={form.schedule} onChange={e => setForm({ ...form, schedule: e.target.value })} className="border p-3 rounded-xl" required />
          <input type="number" placeholder="Monthly Fee" value={form.monthlyFee} onChange={e => setForm({ ...form, monthlyFee: e.target.value })} className="border p-3 rounded-xl" required />
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">Starting Month</label>
            <select value={form.startMonth} onChange={e => setForm({ ...form, startMonth: e.target.value })} className="w-full border p-3 rounded-xl" required>
              {MONTHS.map(month => <option key={month} value={month}>{month}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">Starting Year</label>
            <input type="number" value={form.startYear} onChange={e => setForm({ ...form, startYear: e.target.value })} className="w-full border p-3 rounded-xl" required />
          </div>
          <div className="md:col-span-2 flex gap-3">
            <button type="submit" className="bg-emerald-600 text-white px-6 py-2 rounded-xl">Save</button>
            <button type="button" onClick={() => { setShowForm(false); setEditingId(null); setForm(emptyBatchForm); }} className="px-6 py-2">Cancel</button>
          </div>
        </form>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {batches.map(b => (
          <div key={b.id} className="bg-white p-5 rounded-2xl border">
            <div className="flex justify-between">
              <div><h3 className="font-bold text-xl">{b.name}</h3><p className="text-slate-500">{b.subject}</p></div>
              <div className="flex gap-1">
                <button onClick={() => edit(b)}><Edit3 className="h-4 w-4" /></button>
                <button onClick={() => del(b.id)}><Trash2 className="h-4 w-4 text-red-500" /></button>
              </div>
            </div>
            <div className="mt-4 text-sm text-slate-600">{b.schedule} • ₹{b.monthlyFee}/month</div>
            <div className="mt-2 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              Fees start from {b.startMonth || 'January'} {b.startYear || new Date().getFullYear()}
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
}
