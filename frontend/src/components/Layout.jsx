import { useState } from "react";

export default function Layout({
  children,
  title,
  subtitle,
  sidebar,
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-slate-50 overflow-x-hidden">

      {/* SIDEBAR (desktop + mobile drawer) */}
      {sidebar &&
        sidebar({
          open,
          setOpen,
        })}

      {/* MAIN */}
      <div className="flex flex-1 flex-col min-w-0">

        {/* TOP BAR */}
        <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6">

          {/* LEFT */}
          <div className="flex items-center gap-3 min-w-0">

            {/* MOBILE MENU BUTTON */}
            {sidebar && (
              <button
                onClick={() => setOpen(true)}
                className="md:hidden text-slate-700 text-xl"
              >
                ☰
              </button>
            )}

            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-bold text-slate-900 truncate capitalize">
                {title}
              </h1>

              {subtitle && (
                <p className="text-xs sm:text-sm text-slate-500 truncate">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* RIGHT */}
          <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold shadow-sm shrink-0">
            T
          </div>

        </header>

        {/* CONTENT */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full overflow-x-hidden">
          {children}
        </main>

      </div>
    </div>
  );
}