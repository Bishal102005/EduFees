import { useEffect, useState } from "react";
import { api } from "../api/api";
import { Plus, Check, AlertCircle, IndianRupee, Search, X } from "lucide-react";
import Layout from "../components/Layout";

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

export default function Fees() {
  const [fees, setFees] = useState([]);
  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [form, setForm] = useState({
    studentId: "",
    batchId: "",
    month: MONTHS[new Date().getMonth()],
    year: new Date().getFullYear(),
    amount: "",
    status: "paid",
    paymentMethod: "Cash",
  });

  const load = async () => {
    const f = await api.getFees();
    const s = await api.getStudents();
    const b = await api.getBatches();
    setFees(f);
    setStudents(s);
    setBatches(b);
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();

    const record = {
      ...form,
      id: Date.now().toString(),
      year: Number(form.year),
      amount: Number(form.amount),
      paidDate: form.status === "paid" ? new Date().toISOString() : null,
    };

    await api.addFee(record);

    setShowForm(false);
    setForm({
      studentId: "",
      batchId: "",
      month: MONTHS[new Date().getMonth()],
      year: new Date().getFullYear(),
      amount: "",
      status: "paid",
      paymentMethod: "Cash",
    });

    load();
  };

  const toggleStatus = async (fee) => {
    const updated =
      fee.status === "paid"
        ? { status: "pending", paidDate: null }
        : { status: "paid", paidDate: new Date().toISOString() };

    await api.updateFee(fee.id, updated);
    load();
  };

  const selectedStudentObj = students.find(s => s.id === form.studentId);
  const studentBatchesList = selectedStudentObj
    ? (selectedStudentObj.studentBatches && selectedStudentObj.studentBatches.length > 0
        ? selectedStudentObj.studentBatches
        : (selectedStudentObj.batchId ? [{ batchId: selectedStudentObj.batchId, finalFee: selectedStudentObj.finalFee }] : []))
    : [];

  const filteredFees = fees.filter(f => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    const student = students.find(s => s.id === f.studentId);
    const batch = batches.find(b => b.id === f.batchId);

    const nameMatch = student?.name?.toLowerCase().includes(q);
    const mobileMatch = student?.mobile?.includes(q);
    const batchMatch = batch?.name?.toLowerCase().includes(q);
    const monthMatch = f.month?.toLowerCase().includes(q);
    const statusMatch = f.status?.toLowerCase().includes(q);

    return nameMatch || mobileMatch || batchMatch || monthMatch || statusMatch;
  });

  return (
    <Layout title="Fees" subtitle="Track payments & collections">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">

        <h2 className="text-xl font-bold text-slate-900">Fee Records</h2>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          {/* SEARCH INPUT */}
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search fee records..."
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
            onClick={() => setShowForm(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-700 transition font-semibold text-sm shadow-sm"
          >
            <Plus size={16} /> Collect Fee
          </button>
        </div>

      </div>

      {/* FORM */}
      {showForm && (
        <form className="bg-white border rounded-2xl p-4 sm:p-6 mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">

          <select
            value={form.studentId}
            onChange={(e) => {
              const sId = e.target.value;
              const student = students.find(s => s.id === sId);
              const sBatches = student
                ? (student.studentBatches && student.studentBatches.length > 0
                    ? student.studentBatches
                    : (student.batchId ? [{ batchId: student.batchId, finalFee: student.finalFee }] : []))
                : [];
              const firstBatch = sBatches[0] || {};
              const defaultAmount = firstBatch.finalFee !== undefined ? firstBatch.finalFee : (student ? student.finalFee : "");

              setForm({ 
                ...form, 
                studentId: sId,
                batchId: firstBatch.batchId || "",
                amount: defaultAmount
              });
            }}
            className="border rounded-xl p-3"
            required
          >
            <option value="">Select Student</option>
            {students.map(s => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.mobile})
              </option>
            ))}
          </select>

          <select
            value={form.batchId}
            onChange={(e) => {
              const bId = e.target.value;
              const matchedEnrollment = studentBatchesList.find(b => b.batchId === bId);
              const bObj = batches.find(b => b.id === bId);
              const autoFee = matchedEnrollment ? matchedEnrollment.finalFee : (bObj ? bObj.monthlyFee : form.amount);
              setForm({ ...form, batchId: bId, amount: autoFee });
            }}
            className="border rounded-xl p-3"
            disabled={!form.studentId}
          >
            <option value="">Select Batch (Optional)</option>
            {studentBatchesList.map(item => {
              const bObj = batches.find(b => b.id === item.batchId);
              return (
                <option key={item.batchId} value={item.batchId}>
                  {bObj ? bObj.name : "Batch"} (Fee: ₹{item.finalFee})
                </option>
              );
            })}
          </select>

          <select
            value={form.month}
            onChange={(e) => setForm({ ...form, month: e.target.value })}
            className="border rounded-xl p-3"
          >
            {MONTHS.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Year"
            value={form.year}
            onChange={(e) => setForm({ ...form, year: e.target.value })}
            className="border rounded-xl p-3"
          />

          <input
            type="number"
            placeholder="Amount"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            className="border rounded-xl p-3"
          />

          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            className="border rounded-xl p-3"
          >
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
          </select>

          <select
            value={form.paymentMethod}
            onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
            className="border rounded-xl p-3"
            disabled={form.status !== "paid"}
          >
            <option>Cash</option>
            <option>UPI</option>
            <option>Bank Transfer</option>
            <option>Card</option>
          </select>

          {/* buttons */}
          <div className="sm:col-span-2 flex flex-col sm:flex-row gap-3">

            <button
              onClick={submit}
              className="w-full sm:w-auto bg-green-600 text-white px-5 py-2 rounded-xl hover:bg-green-700 font-semibold"
            >
              Save Record
            </button>

            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="w-full sm:w-auto border px-5 py-2 rounded-xl text-slate-600"
            >
              Cancel
            </button>

          </div>

        </form>
      )}

      {/* FEES CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

        {filteredFees.length === 0 ? (
          <div className="sm:col-span-2 lg:col-span-3 bg-white border rounded-2xl p-8 text-center flex flex-col items-center justify-center">
            <Search className="text-slate-300 mb-2" size={32} />
            <p className="font-semibold text-slate-700">No fee records found</p>
            <p className="text-xs text-slate-400 mt-1">Try adjusting your search query.</p>
          </div>
        ) : (
          filteredFees.map(f => {
          const student = students.find(s => s.id === f.studentId);
          const batch = batches.find(b => b.id === f.batchId);

          return (
            <div
              key={f.id}
              className="bg-white border rounded-2xl p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >

              {/* TOP */}
              <div>
                <div className="flex justify-between items-start">

                  <div>
                    <p className="font-bold text-slate-900">
                      {student?.name || "Unknown"}
                    </p>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      {f.month} {f.year}
                    </p>
                  </div>

                  {f.status === "paid" ? (
                    <Check className="text-green-600 shrink-0" />
                  ) : (
                    <AlertCircle className="text-amber-500 shrink-0" />
                  )}

                </div>

                {batch && (
                  <div className="mt-2">
                    <span className="inline-block bg-indigo-50 text-indigo-700 text-xs px-2.5 py-0.5 rounded-md font-medium">
                      📚 {batch.name}
                    </span>
                  </div>
                )}
              </div>

              {/* AMOUNT */}
              <div className="mt-4">
                <div className="flex items-center gap-1">
                  <IndianRupee className="text-slate-400" size={18} />
                  <p className="text-xl font-bold text-slate-900">₹{f.amount}</p>
                </div>

                {/* FOOTER */}
                <div className="mt-3 pt-3 border-t flex justify-between items-center">

                  <span
                    className={`text-xs px-3 py-1 rounded-full font-semibold ${
                      f.status === "paid"
                        ? "bg-green-50 text-green-600"
                        : "bg-amber-50 text-amber-600"
                    }`}
                  >
                    {f.status.toUpperCase()}
                  </span>

                  <button
                    onClick={() => toggleStatus(f)}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                  >
                    Toggle Status
                  </button>

                </div>
              </div>

            </div>
          );
        }))}

      </div>

    </Layout>
  );
}