import React from 'react';
import Link from 'next/link';

export const Logo: React.FC = () => {
  return (
    <Link href="/" className="flex items-center gap-3 group flex-shrink-0">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-[#2c4a5a] to-[#5a7c8f] rounded-2xl blur-sm group-hover:blur-md transition-all opacity-50"></div>
        <div className="relative bg-gradient-to-br from-[#2c4a5a] via-[#3d5a6d] to-[#5a7c8f] p-2.5 rounded-2xl group-hover:scale-105 transition-transform">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
          </svg>
        </div>
      </div>
      <span className="text-2xl font-bold bg-gradient-to-r from-[#2c4a5a] via-[#3d5a6d] to-[#5a7c8f] bg-clip-text text-transparent">
        TICKUY
      </span>
    </Link>
  );
};
