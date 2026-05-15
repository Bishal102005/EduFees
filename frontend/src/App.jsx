import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { GraduationCap, Shield, Smartphone, ArrowRight, ChevronLeft, LogOut, Lock, BookOpen, TrendingUp, Users } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Batches from './pages/Batches';
import Students from './pages/Students';
import Fees from './pages/Fees';
import Reports from './pages/Reports';
import StudentDashboard from './pages/StudentDashboard';
import { api } from './api/api';

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -8 },
  transition: { duration: 0.25 },
};

const STATS = [
  { icon: Users,      label: 'Students Enrolled', value: '1,240' },
  { icon: TrendingUp, label: 'Fees Collected',     value: '₹8.4L' },
  { icon: BookOpen,   label: 'Active Batches',     value: '18'    },
];

function LoginScreen({ onAuth }) {
  const [mode, setMode]         = useState('select');
  const [password, setPassword] = useState('');
  const [mobile, setMobile]     = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleLogin = async (role) => {
    setLoading(true); setError('');
    const result = await api.login(role, role === 'teacher' ? { password } : { mobile });
    setLoading(false);
    if (result.success) onAuth(result.auth);
    else setError(result.error || 'Login failed. Please try again.');
  };

  return (
    <div className="login-container" style={{
      minHeight: '100vh',
      width: '100%',
      display: 'flex',
      background: '#080e1a',
      fontFamily: "'Inter', 'DM Sans', system-ui, sans-serif",
      overflowX: 'hidden',
      position: 'relative',
    }}>

      <style>{`
        .login-container { flex-direction: row; }
        @media (max-width: 1024px) {
          .login-container { flex-direction: column; }
          .login-left-panel { display: none !important; }
          .login-right-panel { width: 100% !important; padding: 2rem 1.5rem !important; min-height: 100vh; }
          .mobile-only-brand { display: block !important; }
        }
      `}</style>

      {/* ── LEFT PANEL ── */}
      <div style={{
        flex: '1',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '3rem',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(145deg, #0d1b35 0%, #0a1628 40%, #06101f 100%)',
      }}>
        {/* Glowing orb top */}
        <div style={{
          position: 'absolute', top: '-120px', left: '-80px',
          width: '500px', height: '500px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 65%)',
          pointerEvents: 'none',
        }} />
        {/* Glowing orb bottom */}
        <div style={{
          position: 'absolute', bottom: '-100px', right: '-60px',
          width: '400px', height: '400px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 65%)',
          pointerEvents: 'none',
        }} />
        {/* Subtle grid */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.04,
          backgroundImage: 'linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }} />

        {/* Brand */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '14px',
              background: 'linear-gradient(135deg, #6366f1, #818cf8)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 32px rgba(99,102,241,0.4)',
            }}>
              <GraduationCap size={22} color="#fff" strokeWidth={2} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.4rem', color: '#f1f5f9', letterSpacing: '-0.5px' }}>EduFees</div>
              <div style={{ fontSize: '0.7rem', color: '#64748b', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600 }}>Management System</div>
            </div>
          </div>
        </div>

        {/* Hero text */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)',
            borderRadius: '100px', padding: '4px 14px', marginBottom: '1.5rem',
          }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#6366f1' }} />
            <span style={{ fontSize: '0.75rem', color: '#a5b4fc', fontWeight: 600, letterSpacing: '0.06em' }}>TRUSTED BY 200+ INSTITUTES</span>
          </div>

          <h1 style={{
            fontSize: 'clamp(2rem, 3.5vw, 3rem)',
            fontWeight: 800,
            color: '#f8fafc',
            lineHeight: 1.15,
            letterSpacing: '-1px',
            marginBottom: '1.25rem',
          }}>
            Smart Fees<br />
            <span style={{ color: '#6366f1' }}>Collection</span> &<br />
            Management
          </h1>
          <p style={{ fontSize: '1rem', color: '#64748b', lineHeight: 1.7, maxWidth: '380px' }}>
            Streamline fee collection, track payments, and manage student records — all in one powerful platform.
          </p>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: '1.5rem', marginTop: '2.5rem', flexWrap: 'wrap' }}>
            {STATS.map(({ icon: Icon, label, value }) => (
              <div key={label} style={{
                display: 'flex', flexDirection: 'column', gap: '4px',
                padding: '1rem 1.25rem',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '16px',
                minWidth: '110px',
              }}>
                <Icon size={16} color="#6366f1" />
                <div style={{ fontWeight: 700, fontSize: '1.25rem', color: '#f1f5f9', marginTop: '4px' }}>{value}</div>
                <div style={{ fontSize: '0.72rem', color: '#475569', fontWeight: 500 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer note */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{ fontSize: '0.75rem', color: '#334155' }}>© 2025 EduFees · Secure · Reliable · Fast</p>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="login-right-panel" style={{
        width: '480px',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2.5rem',
        background: '#0d1117',
        borderLeft: '1px solid rgba(255,255,255,0.05)',
        position: 'relative',
      }}>
        {/* Corner accent */}
        <div style={{
          position: 'absolute', top: 0, right: 0,
          width: '200px', height: '200px',
          background: 'radial-gradient(circle at top right, rgba(99,102,241,0.1) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ width: '100%', maxWidth: '380px', position: 'relative', zIndex: 1 }}>

          {/* MOBILE BRANDING */}
          <div className="mobile-only-brand" style={{ display: 'none', marginBottom: '2.5rem', textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '12px',
                background: 'linear-gradient(135deg, #6366f1, #818cf8)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(99,102,241,0.3)',
              }}>
                <GraduationCap size={20} color="#fff" />
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 800, fontSize: '1.25rem', color: '#f1f5f9', lineHeight: 1 }}>EduFees</div>
                <div style={{ fontSize: '0.65rem', color: '#475569', fontWeight: 600, textTransform: 'uppercase' }}>Management</div>
              </div>
            </div>
          </div>

          <AnimatePresence mode="wait">

            {/* ── Select mode ── */}
            {mode === 'select' && (
              <motion.div key="select" {...fadeUp}>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.5px', marginBottom: '0.35rem' }}>
                  Welcome back
                </h2>
                <p style={{ color: '#475569', fontSize: '0.9rem', marginBottom: '2.5rem' }}>
                  Choose your role to continue
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {/* Teacher card */}
                  <button
                    onClick={() => setMode('teacher')}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '16px',
                      padding: '1.25rem 1.25rem',
                      background: 'rgba(99,102,241,0.06)',
                      border: '1px solid rgba(99,102,241,0.2)',
                      borderRadius: '16px', cursor: 'pointer',
                      transition: 'all 0.2s', textAlign: 'left', width: '100%',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'rgba(99,102,241,0.12)';
                      e.currentTarget.style.borderColor = 'rgba(99,102,241,0.5)';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'rgba(99,102,241,0.06)';
                      e.currentTarget.style.borderColor = 'rgba(99,102,241,0.2)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <div style={{
                      width: '48px', height: '48px', borderRadius: '14px', flexShrink: 0,
                      background: 'linear-gradient(135deg, #6366f1, #818cf8)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: '0 4px 16px rgba(99,102,241,0.3)',
                    }}>
                      <Shield size={20} color="#fff" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, color: '#f1f5f9', fontSize: '0.95rem' }}>Teacher</div>
                      <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: '2px' }}>Full access · Manage students & fees</div>
                    </div>
                    <ArrowRight size={16} color="#4f5980" />
                  </button>

                  {/* Student card */}
                  <button
                    onClick={() => setMode('student')}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '16px',
                      padding: '1.25rem 1.25rem',
                      background: 'rgba(16,185,129,0.06)',
                      border: '1px solid rgba(16,185,129,0.2)',
                      borderRadius: '16px', cursor: 'pointer',
                      transition: 'all 0.2s', textAlign: 'left', width: '100%',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'rgba(16,185,129,0.12)';
                      e.currentTarget.style.borderColor = 'rgba(16,185,129,0.45)';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'rgba(16,185,129,0.06)';
                      e.currentTarget.style.borderColor = 'rgba(16,185,129,0.2)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <div style={{
                      width: '48px', height: '48px', borderRadius: '14px', flexShrink: 0,
                      background: 'linear-gradient(135deg, #10b981, #34d399)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: '0 4px 16px rgba(16,185,129,0.3)',
                    }}>
                      <Smartphone size={20} color="#fff" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, color: '#f1f5f9', fontSize: '0.95rem' }}>Student</div>
                      <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: '2px' }}>View fees & payment history</div>
                    </div>
                    <ArrowRight size={16} color="#4f5980" />
                  </button>
                </div>

                <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#1e2d3d', marginTop: '2rem' }}>
                  Protected by 256-bit encryption
                </p>
              </motion.div>
            )}

            {/* ── Teacher form ── */}
            {mode === 'teacher' && (
              <motion.div key="teacher" {...fadeUp}>
                <button
                  onClick={() => { setMode('select'); setError(''); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#475569', fontSize: '0.82rem', marginBottom: '2rem', padding: 0,
                  }}
                >
                  <ChevronLeft size={15} /> Back to roles
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '2rem' }}>
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '13px',
                    background: 'linear-gradient(135deg, #6366f1, #818cf8)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Shield size={20} color="#fff" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: '#f1f5f9', fontSize: '1.1rem' }}>Teacher Login</div>
                    <div style={{ fontSize: '0.78rem', color: '#475569' }}>Enter your admin password</div>
                  </div>
                </div>

                {error && (
                  <div style={{
                    background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
                    borderRadius: '12px', padding: '0.75rem 1rem',
                    color: '#fca5a5', fontSize: '0.82rem', marginBottom: '1rem',
                  }}>{error}</div>
                )}

                <div style={{ position: 'relative', marginBottom: '12px' }}>
                  <Lock size={15} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#374151' }} />
                  <input
                    type="password" value={password}
                    onChange={e => setPassword(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleLogin('teacher')}
                    placeholder="Password"
                    style={{
                      width: '100%', paddingLeft: '46px', paddingRight: '16px',
                      paddingTop: '14px', paddingBottom: '14px',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '14px', color: '#f1f5f9',
                      fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box',
                    }}
                    onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.15)'; }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>

                <button
                  onClick={() => handleLogin('teacher')} disabled={loading}
                  style={{
                    width: '100%', padding: '14px',
                    background: loading ? '#3730a3' : 'linear-gradient(135deg, #6366f1, #4f46e5)',
                    border: 'none', borderRadius: '14px',
                    color: '#fff', fontWeight: 700, fontSize: '0.9rem',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 20px rgba(99,102,241,0.35)',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => !loading && (e.currentTarget.style.transform = 'translateY(-1px)')}
                  onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
                >
                  {loading ? 'Signing in…' : 'Sign In as Teacher →'}
                </button>
              </motion.div>
            )}

            {/* ── Student form ── */}
            {mode === 'student' && (
              <motion.div key="student" {...fadeUp}>
                <button
                  onClick={() => { setMode('select'); setError(''); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#475569', fontSize: '0.82rem', marginBottom: '2rem', padding: 0,
                  }}
                >
                  <ChevronLeft size={15} /> Back to roles
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '2rem' }}>
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '13px',
                    background: 'linear-gradient(135deg, #10b981, #34d399)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Smartphone size={20} color="#fff" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: '#f1f5f9', fontSize: '1.1rem' }}>Student Login</div>
                    <div style={{ fontSize: '0.78rem', color: '#475569' }}>Enter your registered mobile</div>
                  </div>
                </div>

                {error && (
                  <div style={{
                    background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
                    borderRadius: '12px', padding: '0.75rem 1rem',
                    color: '#fca5a5', fontSize: '0.82rem', marginBottom: '1rem',
                  }}>{error}</div>
                )}

                <div style={{ position: 'relative', marginBottom: '12px' }}>
                  <Smartphone size={15} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#374151' }} />
                  <input
                    type="tel" value={mobile}
                    onChange={e => setMobile(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleLogin('student')}
                    placeholder="Mobile Number" maxLength={10}
                    style={{
                      width: '100%', paddingLeft: '46px', paddingRight: '16px',
                      paddingTop: '14px', paddingBottom: '14px',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '14px', color: '#f1f5f9',
                      fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box',
                    }}
                    onFocus={e => { e.target.style.borderColor = '#10b981'; e.target.style.boxShadow = '0 0 0 3px rgba(16,185,129,0.15)'; }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>

                <button
                  onClick={() => handleLogin('student')} disabled={loading}
                  style={{
                    width: '100%', padding: '14px',
                    background: loading ? '#065f46' : 'linear-gradient(135deg, #10b981, #059669)',
                    border: 'none', borderRadius: '14px',
                    color: '#fff', fontWeight: 700, fontSize: '0.9rem',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 20px rgba(16,185,129,0.3)',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => !loading && (e.currentTarget.style.transform = 'translateY(-1px)')}
                  onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
                >
                  {loading ? 'Signing in…' : 'Sign In as Student →'}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

/* ── Main App ─────────────────────────────────────────────────────────── */
export default function App() {
  const [auth, setAuth]           = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const handleLogout = () => { setAuth(null); setActiveTab('overview'); };

  if (!auth) return <LoginScreen onAuth={setAuth} />;
  if (auth.role === 'student') return <StudentDashboard studentId={auth.userId} onLogout={handleLogout} />;

  return (
    <div className="flex h-screen w-screen overflow-hidden" style={{ background: '#f1f5f9' }}>
      
      <style>{`
        @media (max-width: 1024px) {
          .desktop-sidebar { 
            position: fixed; 
            z-index: 100; 
            transform: translateX(${isSidebarOpen ? '0' : '-100%'});
            transition: transform 0.3s ease;
          }
          .main-content { padding-top: 60px !important; }
          .mobile-header { display: flex !important; }
        }
      `}</style>

      {/* MOBILE HEADER */}
      <header className="mobile-header" style={{
        display: 'none',
        position: 'fixed',
        top: 0, left: 0, right: 0,
        height: '60px',
        background: '#0d1117',
        alignItems: 'center',
        padding: '0 1rem',
        zIndex: 50,
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '8px',
            background: 'linear-gradient(135deg, #6366f1, #818cf8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <GraduationCap size={16} color="#fff" />
          </div>
          <span style={{ fontWeight: 800, color: '#fff', fontSize: '1rem' }}>EduFees</span>
        </div>

        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          style={{ background: 'none', border: 'none', color: '#fff' }}
        >
          <TrendingUp size={24} style={{ transform: 'rotate(90deg)' }} />
        </button>
      </header>

      {/* Sidebar Overlay (Mobile) */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 90
          }}
        />
      )}

      {/* Sidebar */}
      <aside className="desktop-sidebar" style={{
        width: '256px', flexShrink: 0, height: '100%',
        display: 'flex', flexDirection: 'column',
        background: 'linear-gradient(180deg, #0d1117 0%, #0f172a 100%)',
        borderRight: '1px solid rgba(255,255,255,0.05)',
        boxShadow: '4px 0 24px rgba(0,0,0,0.2)',
      }}>
        {/* Brand */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '1.25rem 1.25rem',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '11px', flexShrink: 0,
            background: 'linear-gradient(135deg, #6366f1, #818cf8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(99,102,241,0.4)',
          }}>
            <GraduationCap size={18} color="#fff" strokeWidth={2} />
          </div>
          <div style={{ fontWeight: 800, fontSize: '1.15rem', color: '#f1f5f9', letterSpacing: '-0.3px' }}>
            Edu<span style={{ color: '#6366f1' }}>Fees</span>
          </div>
        </div>

        {/* Nav */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <Sidebar 
            activeTab={activeTab} 
            onTabChange={(tab) => {
              setActiveTab(tab);
              setIsSidebarOpen(false);
            }} 
            onLogout={handleLogout} 
          />
        </div>
      </aside>

      {/* Main */}
      <div className="main-content" style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>



        {/* Content */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '2rem', background: '#f8fafc' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'overview'  && <Dashboard />}
              {activeTab === 'batches'   && <Batches />}
              {activeTab === 'students'  && <Students />}
              {activeTab === 'fees'      && <Fees />}
              {activeTab === 'reports'   && <Reports />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}