import { useEffect, useState } from "react";
import { api } from "../api/api";
import { Plus, Edit3, Trash2, User } from "lucide-react";
import Layout from "../components/Layout";

const emptyForm = {
  name: "",
  mobile: "",
  email: "",
  address: "",
  batchId: "",
};

export default function Students() {
  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const load = async () => {
    const s = await api.getStudents();
    const b = await api.getBatches();
    setStudents(s);
    setBatches(b);
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();

    const data = {
      ...form,
      id: editingId || Date.now().toString(),
    };

    if (editingId) await api.updateStudent(editingId, data);
    else await api.addStudent(data);

    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
    load();
  };

  const edit = (s) => {
    setEditingId(s.id);
    setForm({
      name: s.name,
      mobile: s.mobile,
      email: s.email,
      address: s.address,
      batchId: s.batchId,
    });
    setShowForm(true);
  };

  const del = async (id) => {
    if (confirm("Delete student?")) {
      await api.deleteStudent(id);
      load();
    }
  };

  return (
    <Layout title="Students" subtitle="Manage all enrolled students">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">

        <h2 className="text-lg sm:text-xl font-bold text-slate-900">
          Student List
        </h2>

        <button
          onClick={() => setShowForm(true)}
          className="w-full sm:w-auto bg-indigo-600 text-white px-4 py-2 rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-700 transition"
        >
          <Plus size={16} /> Add Student
        </button>

      </div>

      {/* FORM (responsive modal/card) */}
      {showForm && (
        <div className="bg-white border rounded-2xl p-4 sm:p-6 mb-6 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-4">

          <input
            placeholder="Full Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="border rounded-xl p-3 w-full"
          />

          <input
            placeholder="Mobile"
            value={form.mobile}
            onChange={(e) => setForm({ ...form, mobile: e.target.value })}
            className="border rounded-xl p-3 w-full"
          />

          <input
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="border rounded-xl p-3 w-full sm:col-span-2"
          />

          <select
            value={form.batchId}
            onChange={(e) => setForm({ ...form, batchId: e.target.value })}
            className="border rounded-xl p-3 w-full sm:col-span-2"
          >
            <option value="">Select Batch</option>
            {batches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>

          <input
            placeholder="Address"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            className="border rounded-xl p-3 w-full sm:col-span-2"
          />

          {/* ACTIONS */}
          <div className="sm:col-span-2 flex flex-col sm:flex-row gap-3">

            <button
              onClick={submit}
              className="w-full sm:w-auto bg-green-600 text-white px-5 py-2 rounded-xl hover:bg-green-700"
            >
              Save
            </button>

            <button
              onClick={() => {
                setShowForm(false);
                setForm(emptyForm);
                setEditingId(null);
              }}
              className="w-full sm:w-auto px-5 py-2 border rounded-xl"
            >
              Cancel
            </button>

          </div>

        </div>
      )}

      {/* STUDENT GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

        {students.map((s) => (
          <div
            key={s.id}
            className="bg-white border rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition"
          >

            {/* TOP */}
            <div className="flex items-start justify-between">

              <div className="flex items-center gap-3">

                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">
                  {s.name?.charAt(0)}
                </div>

                <div>
                  <p className="font-bold text-slate-900 text-sm sm:text-base">
                    {s.name}
                  </p>
                  <p className="text-xs text-slate-500">{s.mobile}</p>
                </div>

              </div>

              <User size={16} className="text-slate-400" />

            </div>

            {/* INFO */}
            <div className="mt-4 text-xs sm:text-sm text-slate-500 space-y-1">
              <p>Email: {s.email || "N/A"}</p>
              <p>Batch: {s.batchId || "Not assigned"}</p>
            </div>

            {/* ACTIONS */}
            <div className="flex justify-end gap-4 mt-4">

              <button
                onClick={() => edit(s)}
                className="text-indigo-600 hover:text-indigo-800 p-2"
              >
                <Edit3 size={16} />
              </button>

              <button
                onClick={() => del(s.id)}
                className="text-red-500 hover:text-red-700 p-2"
              >
                <Trash2 size={16} />
              </button>

            </div>

          </div>
        ))}

      </div>

    </Layout>
  );
}