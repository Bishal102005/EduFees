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

    const data = {
      ...form,
      id: editingId || Date.now().toString(),
      monthlyFee: Number(form.monthlyFee),
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
      startMonth: b.startMonth,
      startYear: b.startYear,
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
    <Layout title="Batches" subtitle="Manage courses & schedules">

      {/* HEADER (mobile stacked) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900">
          All Batches
        </h2>

        <button
          onClick={() => setShowForm(true)}
          className="w-full sm:w-auto bg-indigo-600 text-white px-4 py-2 rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-700 transition"
        >
          <Plus size={16} /> New Batch
        </button>
      </div>

      {/* FORM */}
      {showForm && (
        <form className="bg-white border rounded-2xl p-4 sm:p-6 mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">

          <input
            placeholder="Batch Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="border rounded-xl p-3 w-full"
          />

          <input
            placeholder="Subject"
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
            className="border rounded-xl p-3 w-full"
          />

          <input
            placeholder="Schedule"
            value={form.schedule}
            onChange={(e) => setForm({ ...form, schedule: e.target.value })}
            className="border rounded-xl p-3 w-full"
          />

          <input
            type="number"
            placeholder="Monthly Fee"
            value={form.monthlyFee}
            onChange={(e) => setForm({ ...form, monthlyFee: e.target.value })}
            className="border rounded-xl p-3 w-full"
          />

          <select
            value={form.startMonth}
            onChange={(e) => setForm({ ...form, startMonth: e.target.value })}
            className="border rounded-xl p-3 w-full"
          >
            {MONTHS.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Start Year"
            value={form.startYear}
            onChange={(e) => setForm({ ...form, startYear: e.target.value })}
            className="border rounded-xl p-3 w-full"
          />

          {/* Buttons full width on mobile */}
          <div className="sm:col-span-2 flex flex-col sm:flex-row gap-3 pt-2">

            <button
              onClick={submit}
              className="w-full sm:w-auto bg-green-600 text-white px-5 py-2 rounded-xl hover:bg-green-700"
            >
              Save
            </button>

            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
                setForm(emptyForm);
              }}
              className="w-full sm:w-auto border px-5 py-2 rounded-xl"
            >
              Cancel
            </button>

          </div>
        </form>
      )}

      {/* CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

        {batches.map((b) => (
          <div
            key={b.id}
            className="bg-white border rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition"
          >

            {/* HEADER */}
            <div className="flex items-start justify-between gap-2">

              <div className="flex items-center gap-2 min-w-0">
                <BookOpen className="text-indigo-600 shrink-0" />
                <h3 className="font-bold text-slate-900 truncate">
                  {b.name}
                </h3>
              </div>

              <div className="flex gap-3 shrink-0">

                <button onClick={() => edit(b)}>
                  <Edit3 size={16} />
                </button>

                <button onClick={() => del(b.id)}>
                  <Trash2 size={16} className="text-red-500" />
                </button>

              </div>
            </div>

            {/* INFO */}
            <div className="mt-3 text-sm text-slate-500 space-y-1">
              <p>Subject: {b.subject}</p>
              <p>Schedule: {b.schedule}</p>
            </div>

            {/* FOOTER */}
            <div className="mt-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">

              <span className="text-green-600 font-bold">
                ₹{b.monthlyFee}/month
              </span>

              <span className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full w-fit">
                {b.startMonth} {b.startYear}
              </span>

            </div>

          </div>
        ))}

      </div>

    </Layout>
  );
}