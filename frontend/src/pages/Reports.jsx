import { useEffect, useState } from "react";
import { api } from "../api/api";
import Layout from "../components/Layout";
import {
  Download,
  Users,
  BookOpen,
  IndianRupee,
  AlertCircle,
  Calendar,
  Send,
  Smartphone,
  Sparkles,
} from "lucide-react";

const MONTHS = [
  "All Months",
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

export default function Reports() {
  const [data, setData] = useState({
    students: [],
    batches: [],
    fees: [],
  });

  const [filter, setFilter] = useState({
    month: "All Months",
    year: "All Years",
  });

  const [sendingSms, setSendingSms] = useState(false);
  const [smsStatus, setSmsStatus] = useState(null);
  const [sendingIndividual, setSendingIndividual] = useState({});
  const [sentSmsLogs, setSentSmsLogs] = useState([]);

  const handleSendAllSMS = async () => {
    setSendingSms(true);
    setSmsStatus(null);
    try {
      const res = await api.sendPendingSMS();
      if (res.success) {
        if (res.results && res.results.length > 0) {
          setSentSmsLogs(prev => [...res.results, ...prev]);
        }
        setSmsStatus({
          type: "success",
          message: res.message || `Successfully sent ${res.sentCount} SMS reminders!`
        });
        // Clear message after 8 seconds
        setTimeout(() => setSmsStatus(null), 8000);
      } else {
        setSmsStatus({
          type: "error",
          message: res.error || "Failed to send SMS reminders."
        });
      }
    } catch (err) {
      setSmsStatus({
        type: "error",
        message: err.message
      });
    } finally {
      setSendingSms(false);
    }
  };

  const handleSendIndividualSMS = async (studentId) => {
    setSendingIndividual(prev => ({ ...prev, [studentId]: true }));
    try {
      const res = await api.sendPendingSMS(studentId);
      if (res.success) {
        if (res.results && res.results.length > 0) {
          setSentSmsLogs(prev => [...res.results, ...prev]);
        }
        // Find student name
        const stud = data.students.find(s => s.id === studentId);
        const name = stud ? stud.name : "Student";
        setSmsStatus({
          type: "success",
          message: `SMS reminder sent successfully to ${name}!`
        });
        setTimeout(() => setSmsStatus(null), 8000);
      } else {
        setSmsStatus({
          type: "error",
          message: "Failed to send SMS: " + (res.error || "Unknown error")
        });
      }
    } catch (err) {
      setSmsStatus({
        type: "error",
        message: "Error: " + err.message
      });
    } finally {
      setSendingIndividual(prev => ({ ...prev, [studentId]: false }));
    }
  };

  const load = async () => {
    const students = await api.getStudents();
    const batches = await api.getBatches();
    const fees = await api.getFees();
    setData({ students, batches, fees });
  };

  useEffect(() => {
    load();
  }, []);

  const filterFeeRecords = (feesList) => {
    return feesList.filter(f => {
      const monthMatch = filter.month === "All Months" || f.month === filter.month;
      const yearMatch = filter.year === "All Years" || f.year.toString() === filter.year;
      return monthMatch && yearMatch;
    });
  };

  // ── DUES CALCULATION LOGIC ──────────────────────────────────────────────────
  
  const getAllPendingDues = () => {
    const CAL_MONTHS = [
      "January","February","March","April","May","June",
      "July","August","September","October","November","December"
    ];
    const allDues = [];
    const now = new Date();
    const currentMonthIdx = now.getMonth();
    const currentYear = now.getFullYear();

    data.students.forEach(student => {
      const sBatches = student.studentBatches && student.studentBatches.length > 0
        ? student.studentBatches
        : (student.batchId ? [{ batchId: student.batchId, finalFee: student.finalFee }] : []);

      sBatches.forEach(sb => {
        const batch = data.batches.find(b => b.id === sb.batchId);
        if (!batch) return;

        const targetAmount = sb.finalFee !== undefined && sb.finalFee !== null ? sb.finalFee : batch.monthlyFee;

        let iterMonth = CAL_MONTHS.indexOf(batch.startMonth); 
        let iterYear = Number(batch.startYear);

        if (iterMonth < 0 || !iterYear) {
          const joinDate = new Date(student.joinDate);
          if (!isNaN(joinDate.getTime())) {
            iterMonth = joinDate.getMonth();
            iterYear = joinDate.getFullYear();
          } else {
            iterMonth = 0;
            iterYear = currentYear;
          }
        }

        while (iterYear < currentYear || (iterYear === currentYear && iterMonth <= currentMonthIdx)) {
          const monthName = CAL_MONTHS[iterMonth];
          
          const records = data.fees.filter(f => 
            f.studentId === student.id && 
            (f.batchId === batch.id || (!f.batchId && sBatches.length === 1)) &&
            f.month === monthName && 
            Number(f.year) === iterYear
          );

          const paidSum = records
            .filter(f => f.status === "paid")
            .reduce((sum, f) => sum + Number(f.amount), 0);

          const pendingBalance = targetAmount - paidSum;

          if (pendingBalance > 0) {
            allDues.push({
              id: `due-${student.id}-${batch.id}-${monthName}-${iterYear}`,
              studentId: student.id,
              batchId: batch.id,
              month: monthName,
              year: iterYear,
              amount: pendingBalance,
              status: "pending",
              isPartial: paidSum > 0,
              isAutoGenerated: true
            });
          }

          iterMonth++;
          if (iterMonth > 11) {
            iterMonth = 0;
            iterYear++;
          }
        }
      });
    });

    return allDues;
  };

  const allPendingDues = getAllPendingDues();
  const filteredPendingDues = filterFeeRecords(allPendingDues);
  const filteredPaidFees = filterFeeRecords(data.fees.filter(f => f.status === "paid"));

  const totalCollected = filteredPaidFees.reduce((a, b) => a + b.amount, 0);
  const totalPending = filteredPendingDues.reduce((a, b) => a + b.amount, 0);
  const uniquePendingStudentsCount = new Set(filteredPendingDues.map(d => d.studentId)).size;

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

      {/* FILTERS */}
      <div className="bg-white border rounded-2xl p-4 mb-6 flex flex-col sm:flex-row items-center gap-4">
        <div className="flex items-center gap-2 text-slate-500 min-w-fit">
          <Calendar size={18} />
          <span className="text-sm font-medium">Filter by:</span>
        </div>

        <select
          value={filter.month}
          onChange={(e) => setFilter({ ...filter, month: e.target.value })}
          className="border rounded-xl p-2 w-full sm:w-40 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
        >
          {MONTHS.map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>

        <select
          value={filter.year}
          onChange={(e) => setFilter({ ...filter, year: e.target.value })}
          className="border rounded-xl p-2 w-full sm:w-32 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
        >
          <option value="All Years">All Years</option>
          {[...new Array(5)].map((_, i) => {
            const y = (new Date().getFullYear() - i).toString();
            return <option key={y} value={y}>{y}</option>;
          })}
        </select>

        <div className="flex-1" />

        <button
          onClick={exportCSV}
          className="w-full sm:w-auto bg-slate-900 text-white px-4 py-2 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-800 transition text-sm"
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
              <span>Total Paid Records</span>
              <span className="font-bold">{filteredPaidFees.length}</span>
            </div>

            <div className="flex justify-between">
              <span>Total Pending Dues</span>
              <span className="text-amber-600 font-bold">
                {filteredPendingDues.length}
              </span>
            </div>
          </div>
        </div>

        {/* SMS Dues Notifier Card */}
        <div className="bg-gradient-to-br from-rose-500 to-rose-600 text-white rounded-2xl p-5 sm:p-6 shadow-md relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <Smartphone size={120} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2 bg-white/20 w-fit px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
              <Sparkles size={12} className="text-yellow-300 animate-pulse" />
              <span>SMS Dues Notifier</span>
            </div>
            <h2 className="text-xl font-black mb-1">Send Dues Reminders</h2>
            <p className="text-xs text-rose-100 mb-4 leading-relaxed">
              Instantly notify all students with pending amounts. Reminders will be sent as SMS messages (or simulated terminal console/email alerts).
            </p>
            
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-white/10 rounded-xl p-3 border border-white/5 backdrop-blur-xs">
                <span className="text-[10px] text-rose-200 block uppercase font-bold">Pending Students</span>
                <span className="text-2xl font-black">{uniquePendingStudentsCount}</span>
              </div>
              <div className="bg-white/10 rounded-xl p-3 border border-white/5 backdrop-blur-xs">
                <span className="text-[10px] text-rose-200 block uppercase font-bold">Total Dues</span>
                <span className="text-2xl font-black">₹{totalPending}</span>
              </div>
            </div>

            {smsStatus && (
              <div className={`p-3 rounded-xl text-xs mb-4 flex items-start gap-2 backdrop-blur-xs transition-all ${
                smsStatus.type === 'success' ? 'bg-emerald-500/25 text-emerald-100 border border-emerald-500/30' : 'bg-red-500/25 text-red-100 border border-red-500/30'
              }`}>
                <div className="font-semibold">{smsStatus.message}</div>
              </div>
            )}
          </div>

          <button
            onClick={handleSendAllSMS}
            disabled={sendingSms || uniquePendingStudentsCount === 0}
            className="w-full bg-white text-rose-600 font-bold px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 hover:bg-rose-50 disabled:opacity-50 disabled:hover:bg-white active:scale-[0.98] transition shadow-sm mt-auto text-sm"
          >
            {sendingSms ? (
              <>
                <span className="w-4 h-4 border-2 border-rose-600 border-t-transparent rounded-full animate-spin" />
                Sending Reminders...
              </>
            ) : (
              <>
                <Send size={14} />
                Send SMS Reminders to All
              </>
            )}
          </button>
        </div>

      </div>

      {/* Pending Students List */}
      <div className="mt-6">
        <div className="bg-white border rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="text-amber-500" size={20} />
            <h2 className="font-bold text-slate-900">Pending Payments Details</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b text-slate-500">
                  <th className="pb-3 font-medium">Student Name</th>
                  <th className="pb-3 font-medium">Batch</th>
                  <th className="pb-3 font-medium">Month/Year</th>
                  <th className="pb-3 font-medium text-right">Amount</th>
                  <th className="pb-3 font-medium text-center">Remind</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredPendingDues.length > 0 ? (
                  filteredPendingDues.map(f => {
                    const student = data.students.find(s => s.id === f.studentId);
                    const batch = data.batches.find(b => b.id === f.batchId);
                    return (
                      <tr key={f.id} className="text-slate-700 hover:bg-slate-50">
                        <td className="py-3">
                          <p className="font-medium">{student?.name || "Unknown"}</p>
                          {f.isPartial ? (
                            <span className="text-[10px] bg-amber-50 text-amber-500 px-1 rounded">PARTIAL</span>
                          ) : f.isAutoGenerated && (
                            <span className="text-[10px] bg-red-50 text-red-500 px-1 rounded">MISSING</span>
                          )}
                        </td>
                        <td className="py-3 text-slate-500">{batch?.name || "N/A"}</td>
                        <td className="py-3 text-slate-500">{f.month} {f.year}</td>
                        <td className="py-3 text-right font-bold text-slate-900">₹{f.amount}</td>
                        <td className="py-3 text-center">
                          {student ? (
                            <button
                              onClick={() => handleSendIndividualSMS(student.id)}
                              disabled={sendingIndividual[student.id]}
                              className="inline-flex items-center justify-center p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 disabled:opacity-50 transition active:scale-95"
                              title={`Send SMS reminder to ${student.name}`}
                            >
                              {sendingIndividual[student.id] ? (
                                <span className="w-4 h-4 border-2 border-rose-600 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <Smartphone size={15} />
                              )}
                            </button>
                          ) : (
                            <span className="text-slate-400 text-xs">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" className="py-10 text-center text-slate-400 italic">
                      All fees are up to date! No pending payments.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Sent Messages History (Session) */}
      {sentSmsLogs.length > 0 && (
        <div className="mt-6 bg-slate-950 text-slate-100 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden transition-all duration-300">
          <div className="flex items-center gap-2 mb-4">
            <Smartphone className="text-rose-400 animate-bounce" size={20} />
            <h2 className="font-bold text-lg">Sent Messages Log (This Session)</h2>
          </div>
          
          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {sentSmsLogs.map((log, idx) => (
              <div key={idx} className="bg-slate-900 border border-slate-800/80 rounded-xl p-3.5 hover:border-slate-700 transition flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    <span className="font-bold text-slate-100 text-sm">{log.name}</span>
                    <span className="text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full font-mono">{log.mobile}</span>
                    <span className="text-xs font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full font-mono">₹{log.amount} Pending</span>
                  </div>
                  <p className="text-xs text-slate-300 bg-slate-950 p-2.5 rounded-lg border border-slate-800/50 leading-relaxed font-mono">
                    "Dear {log.name}, this is a gentle reminder from EduFees. Your total pending balance is INR {log.amount}. Please clear your dues as soon as possible. Thank you!"
                  </p>
                </div>
                <div className="flex items-center gap-2 self-end md:self-center">
                  <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-md ${
                    log.success 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}>
                    {log.success ? 'Sent (Simulated)' : 'Failed'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Layout>
  );
}