import { useEffect, useState } from "react";
import { api } from "../api/api";
import { Plus, Edit3, Trash2, BookOpen, Search, X } from "lucide-react";
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
  const [searchQuery, setSearchQuery] = useState("");

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

  // Filter batches based on search query
  const trimmedQuery = searchQuery.trim().toLowerCase();
  const filteredBatches = batches.filter((b) => {
    if (!trimmedQuery) return true;
    const nameMatch = b.name?.toLowerCase().includes(trimmedQuery);
    const subjectMatch = b.subject?.toLowerCase().includes(trimmedQuery);
    const scheduleMatch = b.schedule?.toLowerCase().includes(trimmedQuery);
    const feeTypeMatch = (b.feeType === "full" ? "full course installments total" : "monthly recurring month").includes(trimmedQuery);
    const feeMatch = b.monthlyFee?.toString().includes(trimmedQuery);
    const startMatch = `${b.startMonth || ''} ${b.startYear || ''}`.toLowerCase().includes(trimmedQuery);

    return nameMatch || subjectMatch || scheduleMatch || feeTypeMatch || feeMatch || startMatch;
  });

  return (
    <Layout title="Batches" subtitle="Manage courses, batch fees & schedules">

      {/* HEADER (mobile stacked) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">
            All Batches
          </h2>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          {/* SEARCH INPUT */}
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search batches by name, subject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border rounded-xl pl-9 pr-9 py-2 w-full sm:w-64 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-100 transition"
                title="Clear search"
              >
                <X size={15} />
              </button>
            )}
          </div>

          <button
            onClick={() => {
              setForm(emptyForm);
              setEditingId(null);
              setShowForm(true);
            }}
            className="w-full sm:w-auto bg-indigo-600 text-white px-4 py-2 rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-700 transition font-semibold text-sm shadow-sm shrink-0"
          >
            <Plus size={16} /> New Batch
          </button>
        </div>
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

      {/* SEARCH BANNER IF SEARCHING */}
      {trimmedQuery && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-indigo-50/80 border border-indigo-100 rounded-2xl p-4 mb-6 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shrink-0">
              <Search size={18} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Search Results for "{searchQuery}"
              </h3>
              <p className="text-xs text-indigo-700 font-medium">
                Found {filteredBatches.length} matching {filteredBatches.length === 1 ? "batch" : "batches"}
              </p>
            </div>
          </div>
          <button
            onClick={() => setSearchQuery("")}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-white border border-indigo-200 px-3 py-2 rounded-xl flex items-center justify-center gap-1 hover:bg-indigo-50 transition shadow-xs self-start sm:self-auto"
          >
            <X size={14} /> Clear Search
          </button>
        </div>
      )}

      {/* CARDS */}
      {filteredBatches.length === 0 ? (
        <div className="bg-white border rounded-2xl p-8 sm:p-12 text-center flex flex-col items-center justify-center shadow-xs">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-4">
            <Search size={28} />
          </div>
          <h3 className="font-bold text-slate-800 text-lg mb-1">
            {batches.length === 0 ? "No batches created yet" : "No matching batches found"}
          </h3>
          <p className="text-slate-500 text-sm max-w-md mb-6">
            {batches.length === 0
              ? "Create your first batch to start assigning students and managing fee structures."
              : `We couldn't find any batches matching "${searchQuery}". Try searching by batch name, subject, or schedule.`}
          </p>
          {trimmedQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-indigo-700 transition shadow-sm flex items-center gap-2"
            >
              <X size={16} /> Clear Search Filter
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBatches.map((b) => {
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
      )}

    </Layout>
  );
}