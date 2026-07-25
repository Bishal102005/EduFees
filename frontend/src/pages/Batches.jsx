import { useEffect, useState } from "react";
import { api } from "../api/api";
import { Plus, Edit3, Trash2, BookOpen } from "lucide-react";
import Layout from "../components/Layout";

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

const emptyForm = {
  name: "",
  subject: "",
  schedule: "",
  monthlyFee: "",
  feeType: "monthly", // 'monthly' | 'full'
  startMonth: MONTHS[new Date().getMonth()],
  startYear: new Date().getFullYear().toString(),
};

export default function Batches() {
  const [batches, setBatches] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const load = async () => {
    const data = await api.getBatches();
    setBatches(data);
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();

    if (!form.name.trim() || !form.monthlyFee) {
      alert("Please enter a Batch Name and Batch Amount.");
      return;
    }

    const data = {
      ...form,
      id: editingId || Date.now().toString(),
      monthlyFee: Number(form.monthlyFee),
      feeType: form.feeType || 'monthly',
      startYear: Number(form.startYear),
    };

    if (editingId) {
      await api.updateBatch(editingId, data);
    } else {
      await api.addBatch(data);
    }

    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
    load();
  };

  const edit = (b) => {
    setEditingId(b.id);
    setForm({
      name: b.name,
      subject: b.subject,
      schedule: b.schedule,
      monthlyFee: b.monthlyFee,
      feeType: b.feeType || "monthly",
      startMonth: b.startMonth || MONTHS[new Date().getMonth()],
      startYear: b.startYear ? b.startYear.toString() : new Date().getFullYear().toString(),
    });
    setShowForm(true);
  };

  const del = async (id) => {
    if (confirm("Delete batch?")) {
      await api.deleteBatch(id);
      load();
    }
  };

  return (
    <Layout title="Batches" subtitle="Manage courses, batch fees & schedules">

      {/* HEADER (mobile stacked) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900">
          All Batches
        </h2>

        <button
          onClick={() => {
            setForm(emptyForm);
            setEditingId(null);
            setShowForm(true);
          }}
          className="w-full sm:w-auto bg-indigo-600 text-white px-4 py-2 rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-700 transition"
        >
          <Plus size={16} /> New Batch
        </button>
      </div>

      {/* FORM */}
      {showForm && (
        <form className="bg-white border rounded-2xl p-4 sm:p-6 mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4 shadow-sm">

          <div className="sm:col-span-2">
            <h3 className="font-bold text-slate-900 mb-1">
              {editingId ? "Edit Batch Details" : "Create New Batch"}
            </h3>
            <p className="text-xs text-slate-500 mb-2">
              Set up batch fee structure (Monthly Recurring vs Full Course Fee / Installments)
            </p>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Batch Name *</label>
            <input
              placeholder="e.g. Morning Math Batch"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="border rounded-xl p-3 w-full text-sm"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Subject</label>
            <input
              placeholder="e.g. Mathematics"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              className="border rounded-xl p-3 w-full text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Schedule</label>
            <input
              placeholder="e.g. Mon-Fri 7:00 - 9:00 AM"
              value={form.schedule}
              onChange={(e) => setForm({ ...form, schedule: e.target.value })}
              className="border rounded-xl p-3 w-full text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Batch Payment Type</label>
            <select
              value={form.feeType}
              onChange={(e) => setForm({ ...form, feeType: e.target.value })}
              className="border rounded-xl p-3 w-full text-sm bg-white"
            >
              <option value="monthly">Monthly Recurring (Charged per month)</option>
              <option value="full">Full Course Fee / Installments (Fixed total amount)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">
              {form.feeType === "full" ? "Full Batch Amount (₹ Total) *" : "Monthly Batch Fee (₹ / month) *"}
            </label>
            <input
              type="number"
              placeholder={form.feeType === "full" ? "e.g. 15000" : "e.g. 1500"}
              value={form.monthlyFee}
              onChange={(e) => setForm({ ...form, monthlyFee: e.target.value })}
              className="border rounded-xl p-3 w-full text-sm"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Start Month</label>
              <select
                value={form.startMonth}
                onChange={(e) => setForm({ ...form, startMonth: e.target.value })}
                className="border rounded-xl p-3 w-full text-sm bg-white"
              >
                {MONTHS.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Start Year</label>
              <input
                type="number"
                placeholder="Start Year"
                value={form.startYear}
                onChange={(e) => setForm({ ...form, startYear: e.target.value })}
                className="border rounded-xl p-3 w-full text-sm"
              />
            </div>
          </div>

          {/* Buttons full width on mobile */}
          <div className="sm:col-span-2 flex flex-col sm:flex-row gap-3 pt-2">

            <button
              onClick={submit}
              className="w-full sm:w-auto bg-green-600 text-white px-5 py-2.5 rounded-xl hover:bg-green-700 font-semibold text-sm"
            >
              Save Batch
            </button>

            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
                setForm(emptyForm);
              }}
              className="w-full sm:w-auto border px-5 py-2.5 rounded-xl font-semibold text-sm text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>

          </div>
        </form>
      )}

      {/* CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

        {batches.map((b) => {
          const isFullFee = b.feeType === 'full';

          return (
            <div
              key={b.id}
              className="bg-white border rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >

              {/* HEADER */}
              <div>
                <div className="flex items-start justify-between gap-2">

                  <div className="flex items-center gap-2 min-w-0">
                    <BookOpen className="text-indigo-600 shrink-0" />
                    <h3 className="font-bold text-slate-900 truncate">
                      {b.name}
                    </h3>
                  </div>

                  <div className="flex gap-3 shrink-0">

                    <button onClick={() => edit(b)} className="text-slate-500 hover:text-indigo-600">
                      <Edit3 size={16} />
                    </button>

                    <button onClick={() => del(b.id)} className="text-slate-500 hover:text-red-600">
                      <Trash2 size={16} />
                    </button>

                  </div>
                </div>

                <div className="mt-2">
                  <span className={`inline-block text-[11px] font-semibold px-2.5 py-0.5 rounded-md ${
                    isFullFee ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {isFullFee ? '📦 Full Course / Installments' : '📅 Monthly Recurring'}
                  </span>
                </div>

                {/* INFO */}
                <div className="mt-3 text-sm text-slate-500 space-y-1">
                  <p>Subject: {b.subject || "N/A"}</p>
                  <p>Schedule: {b.schedule || "N/A"}</p>
                </div>
              </div>

              {/* FOOTER */}
              <div className="mt-4 pt-3 border-t flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">

                <div>
                  <p className="text-xs text-slate-400 font-medium">
                    {isFullFee ? 'Total Course Fee' : 'Monthly Fee'}
                  </p>
                  <span className="text-green-600 font-bold text-base">
                    ₹{b.monthlyFee}{isFullFee ? ' (Total)' : '/month'}
                  </span>
                </div>

                <span className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full w-fit font-medium">
                  Starts {b.startMonth} {b.startYear}
                </span>

              </div>

            </div>
          );
        })}

      </div>

    </Layout>
  );
}