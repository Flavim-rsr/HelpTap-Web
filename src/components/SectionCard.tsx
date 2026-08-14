import type { ReactNode } from 'react';
import type React from 'react';

interface Props {
  title: string;
  Icon: React.ComponentType<{ className?: string }>;
  children: ReactNode;
}

export function SectionCard({ title, Icon, children }: Props) {
  return (
    <section aria-label={title} className="rounded-xl bg-white p-4 shadow-sm">
      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
        <Icon aria-hidden className="size-4 text-brand" />
        {title}
      </h2>
      {children}
    </section>
  );
}
