import { useId, type InputHTMLAttributes } from 'react';
import type { LucideIcon } from 'lucide-react';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  Icone: LucideIcon;
}

export function InputComIcone({ label, Icone, ...props }: Props) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1.5 text-left">
      <label htmlFor={id} className="text-sm font-medium text-slate-600">
        {label}
      </label>
      <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 focus-within:ring-2 focus-within:ring-brand">
        <Icone aria-hidden className="size-4 shrink-0 text-slate-400" />
        <input
          id={id}
          className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
          {...props}
        />
      </div>
    </div>
  );
}
