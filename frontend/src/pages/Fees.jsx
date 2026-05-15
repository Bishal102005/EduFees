import { useEffect, useState } from "react";
import { api } from "../api/api";
import { Plus, Check, AlertCircle, IndianRupee } from "lucide-react";
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

  const [form, setForm] = useState({
    studentId: "",
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

    const student = students.find(s => s.id === form.studentId);

    const record = {
      ...form,
      id: Date.now().toString(),
      batchId: student?.batchId,
      year: Number(form.year),
      amount: Number(form.amount),
      paidDate: form.status === "paid" ? new Date().toISOString() : null,
    };

    await api.addFee(record);

    setShowForm(false);
    setForm({
      studentId: "",
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

  return (
    <Layout title="Fees" subtitle="Track payments & collections">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">

        <h2 className="text-xl font-bold text-slate-900">Fee Records</h2>

        <button
          onClick={() => setShowForm(true)}
          className="w-full sm:w-auto bg-indigo-600 text-white px-4 py-2 rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-700 transition"
        >
          <Plus size={16} /> Collect Fee
        </button>

      </div>

      {/* FORM */}
      {showForm && (
        <form className="bg-white border rounded-2xl p-4 sm:p-6 mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">

          <select
            value={form.studentId}
            onChange={(e) => {
              const sId = e.target.value;
              const student = students.find(s => s.id === sId);
              setForm({ 
                ...form, 
                studentId: sId,
                amount: student ? student.finalFee : ""
              });
            }}
            className="border rounded-xl p-3"
            required
          >
            <option value="">Select Student</option>
            {students.map(s => {
              const batch = batches.find(b => b.id === s.batchId);
              return (
                <option key={s.id} value={s.id}>
                  {s.name} ({batch?.name || "No batch"})
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
              className="w-full sm:w-auto bg-green-600 text-white px-5 py-2 rounded-xl hover:bg-green-700"
            >
              Save
            </button>

            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="w-full sm:w-auto border px-5 py-2 rounded-xl"
            >
              Cancel
            </button>

          </div>

        </form>
      )}

      {/* FEES CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

        {fees.map(f => {
          const student = students.find(s => s.id === f.studentId);

          return (
            <div
              key={f.id}
              className="bg-white border rounded-2xl p-5 shadow-sm hover:shadow-md transition"
            >

              {/* TOP */}
              <div className="flex justify-between items-start">

                <div>
                  <p className="font-bold text-slate-900">
                    {student?.name || "Unknown"}
                  </p>
                  <p className="text-xs text-slate-500">
                    {f.month} {f.year}
                  </p>
                </div>

                {f.status === "paid" ? (
                  <Check className="text-green-600" />
                ) : (
                  <AlertCircle className="text-amber-500" />
                )}

              </div>

              {/* AMOUNT */}
              <div className="mt-4 flex items-center gap-2">
                <IndianRupee className="text-slate-400" size={18} />
                <p className="text-xl font-bold">₹{f.amount}</p>
              </div>

              {/* FOOTER */}
              <div className="mt-3 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">

                <span
                  className={`text-xs px-3 py-1 rounded-full font-medium w-fit ${
                    f.status === "paid"
                      ? "bg-green-50 text-green-600"
                      : "bg-amber-50 text-amber-600"
                  }`}
                >
                  {f.status.toUpperCase()}
                </span>

                <button
                  onClick={() => toggleStatus(f)}
                  className="text-xs text-indigo-600 hover:text-indigo-800 w-fit"
                >
                  Toggle Status
                </button>

              </div>

            </div>
          );
        })}

      </div>

    </Layout>
  );
}