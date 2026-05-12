import {
  LayoutDashboard,
  Users,
  BookOpen,
  IndianRupee,
  BarChart3,
  LogOut,
} from "lucide-react";

const tabs = [
  { id: "overview", label: "Dashboard", icon: LayoutDashboard },
  { id: "batches", label: "Batches", icon: BookOpen },
  { id: "students", label: "Students", icon: Users },
  { id: "fees", label: "Fees", icon: IndianRupee },
  { id: "reports", label: "Reports", icon: BarChart3 },
];

export default function Sidebar({ activeTab, onTabChange, onLogout }) {
  return (
    <>
      {/* ================= MOBILE TOP NAV ================= */}
      <div className="md:hidden flex overflow-x-auto gap-2 p-3 border-b border-white/10 bg-slate-950 text-slate-200">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm whitespace-nowrap transition
              ${
                active
                  ? "bg-white/10 text-white"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}

        <button
          onClick={onLogout}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-red-400 hover:text-white hover:bg-red-500/10 text-sm whitespace-nowrap"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>

      {/* ================= DESKTOP FIXED SIDEBAR ================= */}
      <nav className="hidden md:flex flex-col justify-between h-screen w-72 fixed left-0 top-0 bg-gradient-to-b from-slate-950 to-slate-900 text-slate-200 p-4">

        {/* TOP SECTION */}
        <div className="space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`group relative flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition
                ${
                  active
                    ? "bg-white/10 text-white"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {/* ACTIVE BAR */}
                <span
                  className={`absolute left-0 top-2 bottom-2 w-1 rounded-full transition
                  ${active ? "bg-emerald-500" : "bg-transparent"}`}
                />

                {/* ICON */}
                <Icon
                  className={`h-5 w-5 transition ${
                    active
                      ? "text-emerald-400"
                      : "text-slate-400 group-hover:text-white"
                  }`}
                />

                {/* LABEL */}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* BOTTOM SECTION */}
        <div className="border-t border-white/10 pt-3">
          <button
            onClick={onLogout}
            className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:text-white hover:bg-red-500/10 transition"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </nav>
    </>
  );
}