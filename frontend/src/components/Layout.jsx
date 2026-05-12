import { GraduationCap } from 'lucide-react';

export default function Layout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-600 text-white">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <p className="text-lg font-black text-slate-900">EduFees</p>
              <p className="hidden text-xs text-slate-500 sm:block">Teacher Portal</p>
            </div>
          </div>
          <div className="text-sm text-slate-500">Teacher Mode</div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {(title || subtitle) && (
          <div className="mb-6">
            {title && <h1 className="text-3xl font-black text-slate-900">{title}</h1>}
            {subtitle && <p className="text-slate-500 mt-1">{subtitle}</p>}
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
