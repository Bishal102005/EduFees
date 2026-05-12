import { LayoutDashboard, Users, BookOpen, IndianRupee, BarChart3, LogOut } from 'lucide-react';

const tabs = [
  { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'batches', label: 'Batches', icon: BookOpen },
  { id: 'students', label: 'Students', icon: Users },
  { id: 'fees', label: 'Fees', icon: IndianRupee },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
];

export default function Sidebar({ activeTab, onTabChange, onLogout }) {
  return (
    <nav className="h-fit overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex w-full items-center gap-3 px-5 py-4 text-left text-sm font-bold transition ${
              activeTab === tab.id
                ? 'bg-emerald-50 text-emerald-700'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Icon className="h-5 w-5" />
            {tab.label}
          </button>
        );
      })}
      <div className="border-t border-slate-100 p-2">
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition"
        >
          <LogOut className="h-5 w-5" /> Logout
        </button>
      </div>
    </nav>
  );
}
