import { useEffect, useState } from 'react';
import { api } from '../api/api';
import { User, BookOpen, Calendar, IndianRupee, Check, AlertCircle, LogOut } from 'lucide-react';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function monthsFromBatchStart(batch) {
  if (!batch?.startMonth || !batch?.startYear) return 0;
  const startMonthIndex = MONTHS.indexOf(batch.startMonth);
  if (startMonthIndex < 0) return 0;
  const now = new Date();
  return Math.max(0, (now.getFullYear() - Number(batch.startYear)) * 12 + (now.getMonth() - startMonthIndex) + 1);
}

export default function StudentDashboard({ studentId, onLogout }) {
  const [student, setStudent] = useState(null);
  const [batch, setBatch] = useState(null);
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStudentData = async () => {
      const allStudents = await api.getStudents();
      const foundStudent = allStudents.find(s => s.id === studentId);
      
      if (!foundStudent) {
        setLoading(false);
        return;
      }

      setStudent(foundStudent);

      // Load batch
      const allBatches = await api.getBatches();
      const studentBatch = allBatches.find(b => b.id === foundStudent.batchId);
      setBatch(studentBatch || null);

      // Load only this student's fees
      const allFees = await api.getFees();
      const studentFees = allFees
        .filter(f => f.studentId === studentId)
        .sort((a, b) => new Date(`${b.month} 1, ${b.year}`) - new Date(`${a.month} 1, ${a.year}`));

      setFees(studentFees);
      setLoading(false);
    };

    loadStudentData();
  }, [studentId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <p className="text-slate-600 mb-4">Student not found.</p>
          <button onClick={onLogout} className="px-6 py-2 bg-blue-600 text-white rounded-xl">Back to Login</button>
        </div>
      </div>
    );
  }

  const totalPaid = fees.filter(f => f.status === 'paid').reduce((sum, f) => sum + f.amount, 0);
  const totalPending = fees.filter(f => f.status !== 'paid').reduce((sum, f) => sum + f.amount, 0);
  const expectedMonths = monthsFromBatchStart(batch);
  const expectedFee = batch ? expectedMonths * Number(batch.monthlyFee || 0) : totalPaid + totalPending;
  const calculatedPending = Math.max(0, expectedFee - totalPaid);
  const paymentRate = expectedFee > 0 ? Math.min(100, Math.round((totalPaid / expectedFee) * 100)) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <User className="text-white w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-xl text-slate-900">EduFees</span>
              <span className="ml-2 text-sm text-slate-500">Student Portal</span>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Welcome Card */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-3xl p-8 mb-8">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-3xl font-bold">
              {student.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-3xl font-black">Welcome, {student.name.split(' ')[0]}!</h1>
              <p className="text-blue-100 mt-1">View your batch and fee progress</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl border p-6">
            <div className="flex items-center gap-3 mb-2">
              <IndianRupee className="text-green-600" />
              <span className="text-sm text-slate-500">Total Paid</span>
            </div>
            <p className="text-3xl font-black text-green-600">₹{totalPaid}</p>
          </div>
          <div className="bg-white rounded-2xl border p-6">
            <div className="flex items-center gap-3 mb-2">
              <AlertCircle className="text-amber-600" />
              <span className="text-sm text-slate-500">Pending</span>
            </div>
            <p className="text-3xl font-black text-amber-600">₹{calculatedPending}</p>
          </div>
          <div className="bg-white rounded-2xl border p-6">
            <div className="flex items-center gap-3 mb-2">
              <Check className="text-blue-600" />
              <span className="text-sm text-slate-500">Payment Rate</span>
            </div>
            <p className="text-3xl font-black text-blue-600">{paymentRate}%</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* My Batch */}
          <div className="bg-white rounded-2xl border p-6">
            <div className="flex items-center gap-3 mb-5">
              <BookOpen className="text-blue-600" />
              <h2 className="text-xl font-bold">My Batch</h2>
            </div>

            {batch ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-500">Batch Name</p>
                  <p className="font-bold text-lg">{batch.name}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Subject</p>
                  <p className="font-medium">{batch.subject}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Schedule</p>
                  <p className="font-medium">{batch.schedule}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Fees Start From</p>
                  <p className="font-medium">{batch.startMonth || 'January'} {batch.startYear || new Date().getFullYear()}</p>
                </div>
                <div className="pt-3 border-t">
                  <p className="text-sm text-slate-500">Monthly Fee</p>
                  <p className="text-2xl font-black text-blue-600">₹{batch.monthlyFee}</p>
                </div>
                <div className="rounded-xl bg-blue-50 p-3 text-sm text-blue-700">
                  Expected till now: {expectedMonths} month(s), ₹{expectedFee}
                </div>
              </div>
            ) : (
              <p className="text-slate-500">No batch assigned yet.</p>
            )}
          </div>

          {/* Profile Info */}
          <div className="bg-white rounded-2xl border p-6">
            <div className="flex items-center gap-3 mb-5">
              <User className="text-blue-600" />
              <h2 className="text-xl font-bold">My Profile</h2>
            </div>
            <div className="space-y-4 text-sm">
              <div><span className="text-slate-500">Name:</span> <span className="font-medium ml-2">{student.name}</span></div>
              <div><span className="text-slate-500">Mobile:</span> <span className="font-medium ml-2">{student.mobile}</span></div>
              <div><span className="text-slate-500">Email:</span> <span className="font-medium ml-2">{student.email || 'Not added'}</span></div>
              <div><span className="text-slate-500">Address:</span> <span className="font-medium ml-2">{student.address || 'Not added'}</span></div>
              <div><span className="text-slate-500">Joined:</span> <span className="font-medium ml-2">{new Date(student.joinDate).toLocaleDateString()}</span></div>
            </div>
          </div>
        </div>

        {/* Fee History */}
        <div className="mt-8 bg-white rounded-2xl border p-6">
          <div className="flex items-center gap-3 mb-6">
            <Calendar className="text-blue-600" />
            <h2 className="text-xl font-bold">Fee History & Progress</h2>
          </div>

          {fees.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              No fee records yet. Contact your teacher.
            </div>
          ) : (
            <div className="space-y-3">
              {fees.map((fee) => (
                <div key={fee.id} className="flex items-center justify-between p-4 rounded-xl border bg-slate-50">
                  <div>
                    <p className="font-bold">{fee.month} {fee.year}</p>
                    <p className="text-sm text-slate-500">{fee.paymentMethod || 'Payment pending'}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-lg">₹{fee.amount}</p>
                    <div className={`inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full mt-1 ${
                      fee.status === 'paid' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {fee.status === 'paid' ? <Check className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                      {fee.status === 'paid' ? 'Paid' : 'Pending'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <p className="text-center text-xs text-slate-400 mt-8">
          This is a read-only view. Contact your teacher for any changes.
        </p>
      </main>
    </div>
  );
}
