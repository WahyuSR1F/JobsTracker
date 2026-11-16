import { Briefcase } from 'lucide-react';

type AuthShellProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-teal-700 text-white shadow-sm">
            <Briefcase className="h-6 w-6" />
          </span>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-700">Job Tracker</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-stone-900">{title}</h1>
          <p className="mt-2 text-sm leading-relaxed text-stone-600">{subtitle}</p>
        </div>
        <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">{children}</div>
        {footer && <div className="mt-5 text-center text-sm text-stone-600">{footer}</div>}
      </div>
    </main>
  );
}
