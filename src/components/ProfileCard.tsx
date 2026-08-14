import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import type { Role } from '../types';
import { PROFILE_CONFIG } from '../styles/profiles';

export function ProfileCard({ profile }: { profile: Role }) {
  const cfg = PROFILE_CONFIG[profile];
  const Icon = cfg.Icon;
  return (
    <Link
      to={`/login/${profile}`}
      className={`flex items-center gap-4 rounded-2xl bg-gradient-to-r ${cfg.gradient} p-6 text-left text-white shadow-md transition hover:scale-[1.01] focus-visible:ring-2 focus-visible:ring-offset-2`}
    >
      <span className="grid size-14 shrink-0 place-items-center rounded-xl bg-white/20">
        <Icon aria-hidden className="size-7" />
      </span>
      <span className="flex-1">
        <span className="block text-lg font-semibold">{cfg.title}</span>
        <span className="block text-sm text-white/85">{cfg.description}</span>
      </span>
      <ChevronRight aria-hidden className="size-6 shrink-0" />
    </Link>
  );
}
