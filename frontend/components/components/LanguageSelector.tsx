import React from 'react';

export const LanguageSelector: React.FC = () => {
  return (
    <div className="relative group">
      <button className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:text-[#2c4a5a] font-semibold transition-all rounded-lg hover:bg-slate-50">
        <span className="text-lg">🇮🇩</span>
        <span className="text-sm font-medium">ID</span>
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </div>
  );
};
