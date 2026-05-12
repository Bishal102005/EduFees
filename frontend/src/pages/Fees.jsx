import { useEffect, useState } from 'react';
import { api } from '../api/api';
import { Plus, Check, AlertCircle } from 'lucide-react';
import Layout from '../components/Layout';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function Fees() {
  const [fees, setFees] = useState([]);
  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ studentId: '', month: MONTHS[new Date().getMonth()], year: new Date().getFullYear(), amount: '', status: 'paid', paymentMethod: 'Cash' });

  const load = async () => {
    const f = await api.getFees();
    const s = await api.getStudents();
    const b = await api.getBatches();
    setFees(f); setStudents(s); setBatches(b);
  };
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    const student = students.find(s => s.id === form.studentId);
    const record = {
      ...form,
      id: Date.now().toString(),
      batchId: student?.batchId,
      year: Number(form.year),
      amount: Number(form.amount),
      paidDate: form.status === 'paid' ? new Date().toISOString() : null,
      paymentMethod: form.status === 'paid' ? form.paymentMethod : null,
    };
    await api.addFee(record);
    setShowForm(false); load();
  };

  const handleStudentChange = (studentId) => {
    const student = students.find(s => s.id === studentId);
    const batch = batches.find(b => b.id === student?.batchId);
    setForm({
      ...form,
      studentId,
      month: batch?.startMonth || form.month,
      year: batch?.startYear || form.year,
      amount: batch?.monthlyFee ? String(batch.monthlyFee) : form.amount,
    });
  };

  const toggle = async (fee) => {
    const next = fee.status === 'paid' ? { status: 'pending' } : { status: 'paid', paidDate: new Date().toISOString(), paymentMethod: 'Cash' };
    await api.updateFee(fee.id, next);
    load();
  };

  return (
    <Layout title="Fees Collection">
      <div className="flex justify-between mb-6">
        <h1 className="text-3xl font-black">Fees</h1>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl"><Plus className="h-4 w-4" /> Collect Fee</button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="bg-white p-6 rounded-2xl border mb-6 grid md:grid-cols-2 gap-4">
          <select value={form.studentId} onChange={e => handleStudentChange(e.target.value)} className="border p-3 rounded-xl" required>
            <option value="">Select Student</option>
            {students.map(s => {
              const batch = batches.find(b => b.id === s.batchId);
              return <option key={s.id} value={s.id}>{s.name} ({batch?.name || 'No batch'})</option>;
            })}
          </select>
          <select value={form.month} onChange={e => setForm({ ...form, month: e.target.value })} className="border p-3 rounded-xl" required>
            {MONTHS.map(month => <option key={month} value={month}>{month}</option>)}
          </select>
          <input type="number" placeholder="Year" value={form.year} onChange={e => setForm({ ...form, year: e.target.value })} className="border p-3 rounded-xl" required />
          <input type="number" placeholder="Amount" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} className="border p-3 rounded-xl" required />
          <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="border p-3 rounded-xl" required>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
          </select>
          <select value={form.paymentMethod} onChange={e => setForm({ ...form, paymentMethod: e.target.value })} className="border p-3 rounded-xl" disabled={form.status !== 'paid'}>
            <option value="Cash">Cash</option>
            <option value="UPI">UPI</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="Card">Card</option>
          </select>
          <div className="md:col-span-2 rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-700">
            Select a student to auto-fill the batch starting month and monthly fee. You can still change month/year if collecting fees for another month.
          </div>
          <div className="md:col-span-2 flex gap-3">
            <button type="submit" className="bg-emerald-600 text-white px-6 py-2 rounded-xl">Save</button>
            <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2">Cancel</button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-2xl border overflow-hidden">
        {fees.map(f => (
          <div key={f.id} className="flex justify-between p-4 border-b">
            <div>
              <p className="font-bold">{students.find(s => s.id === f.studentId)?.name || 'Unknown'}</p>
              <p className="text-sm text-slate-500">Fees for {f.month} {f.year}</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-black">₹{f.amount}</span>
              <button onClick={() => toggle(f)} className="text-sm text-emerald-600">{f.status === 'paid' ? <Check className="inline" /> : <AlertCircle className="inline" />} Mark {f.status === 'paid' ? 'Pending' : 'Paid'}</button>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
}
