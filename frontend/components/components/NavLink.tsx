import React from 'react';
import Link from 'next/link';

interface NavLinkProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  variant?: 'default' | 'primary';
}

export const NavLink: React.FC<NavLinkProps> = ({
  href,
  icon,
  label,
  variant = 'default',
}) => {
  const styles = variant === 'primary'
    ? 'flex items-center gap-2 px-4 py-2 text-slate-700 hover:text-blue-600 font-medium transition-all rounded-lg hover:bg-blue-50'
    : 'flex items-center gap-2 px-4 py-2 text-slate-700 hover:text-blue-600 font-medium transition-all rounded-lg hover:bg-slate-50';

  return (
    <Link href={href} className={styles}>
      {icon}
      <span className="text-sm font-semibold">{label}</span>
    </Link>
  );
};
