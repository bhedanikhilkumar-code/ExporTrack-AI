import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle: string;
  action?: ReactNode;
}

export default function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="card-panel surface-glow mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
      <div className="min-w-0">
        <h2 className="text-2xl font-bold text-navy-800 dark:text-white md:text-[2rem]">{title}</h2>
        <p className="mt-1.5 max-w-3xl text-sm text-slate-600 dark:text-slate-400 md:text-base">{subtitle}</p>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

