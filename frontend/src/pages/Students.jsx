import { useEffect, useState } from "react";
import { api } from "../api/api";
import { Plus, Edit3, Trash2, User, ChevronDown, ChevronUp, Search, BookOpen } from "lucide-react";
import Layout from "../components/Layout";
import ConfirmModal from "../components/ConfirmModal";

const emptyForm = {
  name: "",
  mobile: "",
  email: "",
  address: "",
  batchId: "",
  discount: 0,
  finalFee: 0,
};

export default function Students() {
  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, studentId: null, studentName: "" });
  
  // New UI states
  const [selectedBatchId, setSelectedBatchId] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [collapsedBatches, setCollapsedBatches] = useState({});

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

  const openAddForm = (batchId = "") => {
    const batch = batches.find(b => b.id === batchId);
    const fee = batch ? batch.monthlyFee : 0;
    setForm({
      ...emptyForm,
      batchId: batchId,
      finalFee: fee,
    });
    setEditingId(null);
    setShowForm(true);
  };

  const edit = (s) => {
    setEditingId(s.id);
    setForm({
      name: s.name,
      mobile: s.mobile,
      email: s.email,
      address: s.address,
      batchId: s.batchId,
      discount: s.discount || 0,
      finalFee: s.finalFee || 0,
    });
    setShowForm(true);
  };

  const del = async (id) => {
    const student = students.find(s => s.id === id);
    setDeleteModal({ isOpen: true, studentId: id, studentName: student?.name || "this student" });
  };

  const handleConfirmDelete = async () => {
    if (deleteModal.studentId) {
      await api.deleteStudent(deleteModal.studentId);
      load();
    }
  };

  const toggleBatchCollapse = (batchId) => {
    setCollapsedBatches(prev => ({
      ...prev,
      [batchId]: !prev[batchId]
    }));
  };

  // Filter students based on search query
  const filteredStudents = students.filter(s => {
    const nameMatch = s.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const mobileMatch = s.mobile?.includes(searchQuery);
    const emailMatch = s.email?.toLowerCase().includes(searchQuery.toLowerCase());
    return nameMatch || mobileMatch || emailMatch;
  });

  // Group students by batchId
  const groupedStudents = batches.reduce((acc, b) => {
    acc[b.id] = filteredStudents.filter(s => s.batchId === b.id);
    return acc;
  }, {});

  const unassignedStudents = filteredStudents.filter(s => 
    !s.batchId || !batches.some(b => b.id === s.batchId)
  );

  const renderStudentCard = (s) => (
    <div
      key={s.id}
      className="bg-white border rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition duration-200 flex flex-col justify-between"
    >
      {/* TOP */}
      <div>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm sm:text-base shrink-0">
              {s.name?.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-slate-900 text-sm sm:text-base truncate">
                {s.name}
              </p>
              <p className="text-xs text-slate-500">{s.mobile}</p>
            </div>
          </div>
          <User size={16} className="text-slate-400 shrink-0" />
        </div>

        {/* INFO */}
        <div className="mt-4 text-xs sm:text-sm text-slate-500 space-y-1">
          <p className="truncate">Email: {s.email || "N/A"}</p>
          <p className="truncate">
            Batch: {batches.find(b => b.id === s.batchId)?.name || "Not assigned"}
          </p>
        </div>
      </div>

      {/* FOOTER & ACTIONS */}
      <div className="mt-4">
        <div className="flex justify-between items-center bg-slate-50 p-2 rounded-lg text-xs sm:text-sm">
          <span className="text-slate-500">Custom Fee:</span>
          <span className="font-bold text-indigo-600">₹{s.finalFee}</span>
        </div>

        <div className="flex justify-end gap-3 mt-3">
          <button
            onClick={() => edit(s)}
            className="text-indigo-600 hover:text-indigo-800 p-1.5 rounded-lg hover:bg-indigo-50 transition"
          >
            <Edit3 size={16} />
          </button>
          <button
            onClick={() => del(s.id)}
            className="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 transition"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <Layout title="Students" subtitle="Manage all enrolled students">

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
        onConfirm={handleConfirmDelete}
        title="Delete Student?"
        message={`Are you sure you want to delete ${deleteModal.studentName}? This action will remove all their records permanently.`}
        confirmText="Yes, Delete"
      />

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">
            Student Directory
          </h2>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          {/* SEARCH INPUT */}
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border rounded-xl pl-9 pr-4 py-2 w-full sm:w-60 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
            />
          </div>

          <button
            onClick={() => openAddForm("")}
            className="bg-indigo-600 text-white px-4 py-2 rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-700 transition font-semibold text-sm shadow-sm"
          >
            <Plus size={16} /> Add Student
          </button>
        </div>
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
            onChange={(e) => {
              const bId = e.target.value;
              const batch = batches.find(b => b.id === bId);
              const fee = batch ? batch.monthlyFee : 0;
              setForm({ 
                ...form, 
                batchId: bId,
                finalFee: Math.max(0, fee - form.discount)
              });
            }}
            className="border rounded-xl p-3 w-full"
          >
            <option value="">Select Batch</option>
            {batches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} (₹{b.monthlyFee})
              </option>
            ))}
          </select>

          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-xs text-slate-500 ml-1">Deduct (₹)</label>
              <input
                type="number"
                placeholder="Deduct"
                value={form.discount}
                onChange={(e) => {
                  const disc = Number(e.target.value);
                  const batch = batches.find(b => b.id === form.batchId);
                  const fee = batch ? batch.monthlyFee : 0;
                  setForm({ 
                    ...form, 
                    discount: disc,
                    finalFee: Math.max(0, fee - disc)
                  });
                }}
                className="border rounded-xl p-3 w-full"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-slate-500 ml-1">Final Fee (₹)</label>
              <input
                type="number"
                value={form.finalFee}
                readOnly
                className="border rounded-xl p-3 w-full bg-slate-50 font-bold text-indigo-600"
              />
            </div>
          </div>

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
              className="w-full sm:w-auto bg-green-600 text-white px-5 py-2 rounded-xl hover:bg-green-700 transition"
            >
              Save
            </button>
            <button
              onClick={() => {
                setShowForm(false);
                setForm(emptyForm);
                setEditingId(null);
              }}
              className="w-full sm:w-auto px-5 py-2 border rounded-xl hover:bg-slate-50 transition"
            >
              Cancel
            </button>
          </div>

        </div>
      )}

      {/* BATCH FILTER TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-hide">
        <button
          onClick={() => setSelectedBatchId("all")}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition shrink-0 flex items-center gap-2 ${
            selectedBatchId === "all"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
              : "bg-white border text-slate-600 hover:bg-slate-50"
          }`}
        >
          <span>All Students</span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            selectedBatchId === "all" ? "bg-indigo-500 text-white" : "bg-slate-100 text-slate-600"
          }`}>
            {filteredStudents.length}
          </span>
        </button>

        {batches.map(b => {
          const count = filteredStudents.filter(s => s.batchId === b.id).length;
          const active = selectedBatchId === b.id;
          return (
            <button
              key={b.id}
              onClick={() => setSelectedBatchId(b.id)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition shrink-0 flex items-center gap-2 ${
                active
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
                  : "bg-white border text-slate-600 hover:bg-slate-50"
              }`}
            >
              <span>{b.name}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                active ? "bg-indigo-500 text-white" : "bg-slate-100 text-slate-600"
              }`}>
                {count}
              </span>
            </button>
          );
        })}

        <button
          onClick={() => setSelectedBatchId("unassigned")}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition shrink-0 flex items-center gap-2 ${
            selectedBatchId === "unassigned"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
              : "bg-white border text-slate-600 hover:bg-slate-50"
          }`}
        >
          <span>Unassigned</span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            selectedBatchId === "unassigned" ? "bg-indigo-500 text-white" : "bg-slate-100 text-slate-600"
          }`}>
            {unassignedStudents.length}
          </span>
        </button>
      </div>

      {/* ROSTER SECTION */}
      <div className="space-y-6">
        {/* Render selected batches */}
        {batches
          .filter(b => selectedBatchId === "all" || selectedBatchId === b.id)
          .map(b => {
            const batchStudents = groupedStudents[b.id] || [];
            const isCollapsed = collapsedBatches[b.id] || false;

            return (
              <div key={b.id} className="bg-white border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition duration-200">
                {/* BATCH HEADER */}
                <div 
                  onClick={() => toggleBatchCollapse(b.id)}
                  className="p-4 bg-slate-50/70 border-b flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer select-none hover:bg-slate-50 transition"
                >
                  <div className="flex items-start md:items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                      <BookOpen size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-slate-900 text-base md:text-lg">
                          {b.name}
                        </h3>
                        <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-semibold">
                          {batchStudents.length} {batchStudents.length === 1 ? "Student" : "Students"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 flex items-center gap-3 mt-1 flex-wrap">
                        <span>📚 {b.subject}</span>
                        <span className="hidden sm:inline">•</span>
                        <span>🕒 {b.schedule}</span>
                        <span className="hidden sm:inline">•</span>
                        <span>💰 ₹{b.monthlyFee}/mo</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-3 self-stretch md:self-auto border-t md:border-t-0 pt-2 md:pt-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openAddForm(b.id);
                      }}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition"
                    >
                      <Plus size={14} /> Add Student
                    </button>

                    <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center shrink-0 transition hover:bg-slate-200">
                      {isCollapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                    </div>
                  </div>
                </div>

                {/* STUDENTS GRID */}
                {!isCollapsed && (
                  <div className="p-4 sm:p-5">
                    {batchStudents.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 px-4 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/30">
                        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
                          <User size={24} />
                        </div>
                        <h4 className="font-semibold text-slate-700 text-sm mb-1">No students in this batch</h4>
                        <p className="text-xs text-slate-400 max-w-xs mb-3">Add new students to assign them to {b.name}.</p>
                        <button
                          onClick={() => openAddForm(b.id)}
                          className="bg-indigo-600 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition font-medium flex items-center gap-1"
                        >
                          <Plus size={12} /> Add Student
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {batchStudents.map(s => renderStudentCard(s))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

        {/* Render Unassigned Students section */}
        {(selectedBatchId === "all" || selectedBatchId === "unassigned") && (
          <div className="bg-white border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition duration-200">
            {/* UNASSIGNED HEADER */}
            <div 
              onClick={() => toggleBatchCollapse("unassigned")}
              className="p-4 bg-slate-50/70 border-b flex items-center justify-between cursor-pointer select-none hover:bg-slate-50 transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <User size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-base md:text-lg">
                      Unassigned Students
                    </h3>
                    <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-semibold">
                      {unassignedStudents.length}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">Students not enrolled in any batch</p>
                </div>
              </div>

              <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center shrink-0 transition hover:bg-slate-200">
                {collapsedBatches["unassigned"] ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
              </div>
            </div>

            {/* UNASSIGNED GRID */}
            {!collapsedBatches["unassigned"] && (
              <div className="p-4 sm:p-5">
                {unassignedStudents.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-6 px-4 text-center border border-dashed rounded-xl bg-slate-50/20">
                    <p className="text-xs text-slate-400 text-center">All students are assigned to a batch.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {unassignedStudents.map(s => renderStudentCard(s))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

    </Layout>
  );
}