import { useEffect, useState } from "react";
import { api } from "../api/api";
import Layout from "../components/Layout";
import {
  Download,
  Users,
  BookOpen,
  IndianRupee,
  AlertCircle,
} from "lucide-react";

export default function Reports() {
  const [data, setData] = useState({
    students: [],
    batches: [],
    fees: [],
  });

  const load = async () => {
    const students = await api.getStudents();
    const batches = await api.getBatches();
    const fees = await api.getFees();
    setData({ students, batches, fees });
  };

  useEffect(() => {
    load();
  }, []);

  const totalCollected = data.fees
    .filter((f) => f.status === "paid")
    .reduce((a, b) => a + b.amount, 0);

  const totalPending = data.fees
    .filter((f) => f.status !== "paid")
    .reduce((a, b) => a + b.amount, 0);

  const exportCSV = () => {
    const headers = ["Student", "Batch", "Month", "Year", "Amount", "Status"];

    const rows = data.fees.map((f) => {
      const student = data.students.find((s) => s.id === f.studentId);
      const batch = data.batches.find((b) => b.id === f.batchId);

      return [
        student?.name || "",
        batch?.name || "",
        f.month,
        f.year,
        f.amount,
        f.status,
      ];
    });

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join(
      "\n"
    );

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "edufees-report.csv";
    a.click();
  };

  const stats = [
    {
      label: "Students",
      value: data.students.length,
      icon: Users,
      color: "text-indigo-600",
    },
    {
      label: "Batches",
      value: data.batches.length,
      icon: BookOpen,
      color: "text-blue-600",
    },
    {
      label: "Collected",
      value: `₹${totalCollected}`,
      icon: IndianRupee,
      color: "text-green-600",
    },
    {
      label: "Pending",
      value: `₹${totalPending}`,
      icon: AlertCircle,
      color: "text-amber-600",
    },
  ];

  return (
    <Layout title="Reports" subtitle="Analytics & export data">

      {/* Export Button */}
      <div className="flex justify-end mb-6">
        <button
          onClick={exportCSV}
          className="w-full sm:w-auto bg-slate-900 text-white px-4 py-2 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-800 transition"
        >
          <Download size={16} /> Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <div
              key={i}
              className="bg-white border rounded-2xl p-4 sm:p-5 shadow-sm"
            >
              <Icon className={`${s.color} mb-2`} />
              <p className="text-xl sm:text-2xl font-black text-slate-900">
                {s.value}
              </p>
              <p className="text-xs sm:text-sm text-slate-500">
                {s.label}
              </p>
            </div>
          );
        })}
      </div>

      {/* Main Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Fee Overview */}
        <div className="bg-white border rounded-2xl p-5">
          <h2 className="font-bold mb-4 text-slate-900">Fee Overview</h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span>Total Records</span>
              <span className="font-bold">{data.fees.length}</span>
            </div>

            <div className="flex justify-between">
              <span>Paid Fees</span>
              <span className="text-green-600 font-bold">
                {data.fees.filter((f) => f.status === "paid").length}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Pending Fees</span>
              <span className="text-amber-600 font-bold">
                {data.fees.filter((f) => f.status !== "paid").length}
              </span>
            </div>
          </div>
        </div>

        {/* Clean Insights (REMOVED AI TEXT) */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-5 sm:p-6">
          <h2 className="font-bold mb-3">Insights</h2>

          <p className="text-sm text-slate-300 leading-relaxed">
            • Fee collection tracking is active <br />
            • Pending payments require follow-up <br />
            • Batch-wise reporting helps better management <br />
            • Use export for financial analysis
          </p>
        </div>

      </div>
    </Layout>
  );
}