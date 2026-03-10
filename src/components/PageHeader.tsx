import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle: string;
  action?: ReactNode;
}

export default function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="card-surface mb-6 flex flex-col justify-between gap-4 p-5 md:flex-row md:items-center md:p-6">
      <div className="min-w-0">
        <h2 className="text-2xl font-bold tracking-tight text-navy-800 md:text-3xl">{title}</h2>
        <p className="mt-1.5 max-w-3xl text-sm text-slate-600 md:text-base">{subtitle}</p>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

