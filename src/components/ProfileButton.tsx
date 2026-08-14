import type { ButtonHTMLAttributes } from 'react';
import type { Role } from '../types';
import { PROFILE_CONFIG } from '../styles/profiles';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  profile: Role;
}

export function ProfileButton({ profile, children, ...props }: Props) {
  const cfg = PROFILE_CONFIG[profile];
  return (
    <button
      className={`w-full rounded-xl bg-gradient-to-r ${cfg.gradient} px-4 py-3.5 text-base font-semibold text-white shadow-md transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50`}
      {...props}
    >
      {children}
    </button>
  );
}
