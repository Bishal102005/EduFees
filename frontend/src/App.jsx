import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { GraduationCap, Shield, Smartphone, ArrowRight } from 'lucide-react';

import Sidebar from './components/Sidebar';
import Layout from './components/Layout';

import Dashboard from './pages/Dashboard';
import Batches from './pages/Batches';
import Students from './pages/Students';
import Fees from './pages/Fees';
import Reports from './pages/Reports';
import StudentDashboard from './pages/StudentDashboard';

import { api } from './api/api';

export default function App() {
  const [auth, setAuth] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loginMode, setLoginMode] = useState('select');
  const [password, setPassword] = useState('');
  const [mobile, setMobile] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (role) => {
    let result;
    if (role === 'teacher') {
      result = await api.login('teacher', { password });
    } else {
      result = await api.login('student', { mobile });
    }
    if (result.success) {
      setAuth(result.auth);
    } else {
      setError(result.error || 'Login failed');
    }
  };

  const handleLogout = () => {
    setAuth(null);
    setPassword('');
    setMobile('');
    setError('');
    setLoginMode('select');
  };

  if (!auth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8">
          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center">
              <GraduationCap className="text-white w-8 h-8" />
            </div>
          </div>
          <h1 className="text-center text-3xl font-black mb-1">EduFees</h1>
          <p className="text-center text-slate-500 mb-8">Fees Collection System</p>

          {loginMode === 'select' && (
            <div className="space-y-4">
              <button onClick={() => setLoginMode('teacher')} className="w-full flex items-center gap-4 p-5 rounded-2xl border hover:border-emerald-300">
                <Shield className="text-emerald-600" /> <span className="font-bold">Login as Teacher</span> <ArrowRight className="ml-auto" />
              </button>
              <button onClick={() => setLoginMode('student')} className="w-full flex items-center gap-4 p-5 rounded-2xl border hover:border-blue-300">
                <Smartphone className="text-blue-600" /> <span className="font-bold">Login as Student</span> <ArrowRight className="ml-auto" />
              </button>
            </div>
          )}

          {loginMode === 'teacher' && (
            <form onSubmit={(e) => { e.preventDefault(); handleLogin('teacher'); }} className="space-y-4">
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="w-full border p-4 rounded-2xl" required />
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button type="submit" className="w-full bg-emerald-600 text-white py-3 rounded-2xl font-bold">Login as Teacher</button>
              <button type="button" onClick={() => setLoginMode('select')} className="w-full text-sm text-slate-500">Back</button>
            </form>
          )}

          {loginMode === 'student' && (
            <form onSubmit={(e) => { e.preventDefault(); handleLogin('student'); }} className="space-y-4">
              <input type="tel" value={mobile} onChange={e => setMobile(e.target.value)} placeholder="Mobile Number" className="w-full border p-4 rounded-2xl" required maxLength={10} />
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-2xl font-bold">Login as Student</button>
              <button type="button" onClick={() => setLoginMode('select')} className="w-full text-sm text-slate-500">Back</button>
            </form>
          )}
        </div>
      </div>
    );
  }

  // Student View (Read-only)
  if (auth.role === 'student') {
    return <StudentDashboard studentId={auth.userId} onLogout={handleLogout} />;
  }

  // Teacher Dashboard with Sidebar
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-50 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-emerald-600 text-white rounded-xl flex items-center justify-center"><GraduationCap className="h-5 w-5" /></div>
            <div><span className="font-black text-xl">EduFees</span></div>
          </div>
          <button onClick={handleLogout} className="text-sm text-red-600 hover:underline">Logout</button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 grid lg:grid-cols-[240px_1fr] gap-6">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} onLogout={handleLogout} />

        <div>
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && <Dashboard key="overview" />}
            {activeTab === 'batches' && <Batches key="batches" />}
            {activeTab === 'students' && <Students key="students" />}
            {activeTab === 'fees' && <Fees key="fees" />}
            {activeTab === 'reports' && <Reports key="reports" />}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
