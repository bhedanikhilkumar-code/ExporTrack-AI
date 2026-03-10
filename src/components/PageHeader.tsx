import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle: string;
  action?: ReactNode;
}

export default function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-soft md:flex-row md:items-center">
      <div>
        <h2 className="text-2xl font-semibold text-navy-800">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  );
}
