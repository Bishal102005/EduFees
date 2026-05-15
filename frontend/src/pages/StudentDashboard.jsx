import { useEffect, useState } from "react";
import { api } from "../api/api";
import {
  User,
  BookOpen,
  Calendar,
  IndianRupee,
  Check,
  AlertCircle,
  LogOut,
} from "lucide-react";

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

function monthsFromBatchStart(batch) {
  if (!batch?.startMonth || !batch?.startYear) return 0;
  const startMonthIndex = MONTHS.indexOf(batch.startMonth);
  if (startMonthIndex < 0) return 0;

  const now = new Date();
  return Math.max(
    0,
    (now.getFullYear() - Number(batch.startYear)) * 12 +
      (now.getMonth() - startMonthIndex) +
      1
  );
}

export default function StudentDashboard({ studentId, onLogout }) {
  const [student, setStudent] = useState(null);
  const [batch, setBatch] = useState(null);
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const students = await api.getStudents();
      const found = students.find((s) => s.id === studentId);

      if (!found) return setLoading(false);

      setStudent(found);

      const batches = await api.getBatches();
      setBatch(batches.find((b) => b.id === found.batchId));

      const allFees = await api.getFees();
      setFees(
        allFees
          .filter((f) => f.studentId === studentId)
          .sort(
            (a, b) =>
              new Date(`${b.month} 1, ${b.year}`) -
              new Date(`${a.month} 1, ${a.year}`)
          )
      );

      setLoading(false);
    };

    load();
  }, [studentId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b1220]">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-indigo-400 border-t-transparent"></div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b1220] text-white">
        <button
          onClick={onLogout}
          className="px-6 py-2 bg-indigo-600 rounded-xl"
        >
          Back to Login
        </button>
      </div>
    );
  }

  const totalPaid = fees
    .filter((f) => f.status === "paid")
    .reduce((a, b) => a + b.amount, 0);

  const expectedMonths = monthsFromBatchStart(batch);
  const monthlyRate = student.finalFee || (batch ? Number(batch.monthlyFee) : 0);
  const expectedFee = batch
    ? expectedMonths * monthlyRate
    : totalPaid;

  const pending = Math.max(0, expectedFee - totalPaid);
  const rate =
    expectedFee > 0 ? Math.round((totalPaid / expectedFee) * 100) : 0;

  const Card = ({ children }) => (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur hover:bg-white/10 transition">
      {children}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0b1220] text-white">

      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-[#0b1220]/80 backdrop-blur border-b border-white/10">
        <div className="flex items-center justify-between px-4 md:px-8 h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold">EduFees</p>
              <p className="text-xs text-gray-400">Student Portal</p>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="flex items-center gap-2 text-sm px-3 py-2 rounded-xl hover:bg-red-500/10 text-red-400"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </header>

      <main className="p-4 md:p-8 max-w-5xl mx-auto">

        {/* WELCOME */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-6 md:p-8 mb-6">
          <h1 className="text-2xl md:text-3xl font-bold">
            Welcome, {student.name.split(" ")[0]} 👋
          </h1>
          <p className="text-sm text-white/80 mt-1">
            Your fee & batch dashboard
          </p>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Card>
            <p className="text-gray-400 text-sm">Paid</p>
            <p className="text-2xl font-bold text-green-400">₹{totalPaid}</p>
          </Card>

          <Card>
            <p className="text-gray-400 text-sm">Pending</p>
            <p className="text-2xl font-bold text-amber-400">₹{pending}</p>
          </Card>

          <Card>
            <p className="text-gray-400 text-sm">Progress</p>
            <p className="text-2xl font-bold text-indigo-400">{rate}%</p>
          </Card>
        </div>

        {/* GRID */}
        <div className="grid md:grid-cols-2 gap-6">

          {/* BATCH */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="text-indigo-400" />
              <h2 className="font-bold">My Batch</h2>
            </div>

            {batch ? (
              <div className="space-y-2 text-sm">
                <p><span className="text-gray-400">Name:</span> {batch.name}</p>
                <p><span className="text-gray-400">Subject:</span> {batch.subject}</p>
                <p><span className="text-gray-400">Schedule:</span> {batch.schedule}</p>
                <div className="mt-2">
                  <p className="text-gray-400 text-xs uppercase tracking-wider font-semibold">My Monthly Fee</p>
                  <p className="text-indigo-400 font-bold text-lg">
                    ₹{student.finalFee || batch.monthlyFee}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-gray-400">No batch assigned</p>
            )}
          </Card>

          {/* PROFILE */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <User className="text-indigo-400" />
              <h2 className="font-bold">Profile</h2>
            </div>

            <div className="text-sm space-y-2">
              <p>{student.name}</p>
              <p className="text-gray-400">{student.mobile}</p>
              <p className="text-gray-400">{student.email || "-"}</p>
            </div>
          </Card>
        </div>

        {/* FEES */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="text-indigo-400" />
            <h2 className="font-bold">Fee History</h2>
          </div>

          <div className="space-y-3">
            {fees.map((f) => (
              <div
                key={f.id}
                className="flex justify-between items-center border-b border-white/10 pb-2"
              >
                <div>
                  <p className="font-medium">
                    {f.month} {f.year}
                  </p>
                  <p className="text-xs text-gray-400">
                    {f.paymentMethod || "Pending"}
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-bold">₹{f.amount}</p>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      f.status === "paid"
                        ? "bg-green-500/10 text-green-400"
                        : "bg-amber-500/10 text-amber-400"
                    }`}
                  >
                    {f.status === "paid" ? "Paid" : "Pending"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

      </main>
    </div>
  );
}