import { useEffect, useState } from 'react';
import { api } from '../api/api';
import { Plus, Edit3, Trash2 } from 'lucide-react';
import Layout from '../components/Layout';

export default function Students() {
  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', mobile: '', email: '', address: '', batchId: '' });
  const [editingId, setEditingId] = useState(null);

  const load = async () => {
    const s = await api.getStudents();
    const b = await api.getBatches();
    setStudents(s); setBatches(b);
  };
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    const data = { ...form, id: editingId || Date.now().toString() };
    if (editingId) await api.updateStudent(editingId, data);
    else await api.addStudent(data);
    setShowForm(false); setForm({ name: '', mobile: '', email: '', address: '', batchId: '' }); setEditingId(null); load();
  };

  const edit = (s) => { setEditingId(s.id); setForm({ name: s.name, mobile: s.mobile, email: s.email, address: s.address, batchId: s.batchId }); setShowForm(true); };
  const del = async (id) => { if (confirm('Delete student?')) { await api.deleteStudent(id); load(); } };

  return (
    <Layout title="Students">
      <div className="flex justify-between mb-6">
        <h1 className="text-3xl font-black">Students</h1>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl"><Plus className="h-4 w-4" /> Add Student</button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="bg-white p-6 rounded-2xl border mb-6 grid md:grid-cols-2 gap-4">
          <input placeholder="Full Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="border p-3 rounded-xl" required />
          <input placeholder="Mobile" value={form.mobile} onChange={e => setForm({ ...form, mobile: e.target.value })} className="border p-3 rounded-xl" required />
          <input placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="border p-3 rounded-xl" />
          <select value={form.batchId} onChange={e => setForm({ ...form, batchId: e.target.value })} className="border p-3 rounded-xl" required>
            <option value="">Select Batch</option>
            {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          <input placeholder="Address" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} className="border p-3 rounded-xl md:col-span-2" />
          <div className="md:col-span-2 flex gap-3">
            <button type="submit" className="bg-emerald-600 text-white px-6 py-2 rounded-xl">Save</button>
            <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2">Cancel</button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-2xl border overflow-hidden">
        {students.map(s => (
          <div key={s.id} className="flex items-center justify-between p-4 border-b last:border-0">
            <div><p className="font-bold">{s.name}</p><p className="text-sm text-slate-500">{s.mobile}</p></div>
            <div className="flex gap-2">
              <button onClick={() => edit(s)}><Edit3 className="h-4 w-4" /></button>
              <button onClick={() => del(s.id)}><Trash2 className="h-4 w-4 text-red-500" /></button>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
}
