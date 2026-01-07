import React from 'react';

interface InputProps {
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  required?: boolean;
}

export const Input: React.FC<InputProps> = ({
  type = 'text',
  placeholder,
  value,
  onChange,
  className = '',
  icon,
  disabled = false,
  required = false,
}) => {
  const baseStyles = 'w-full py-3 bg-slate-50/80 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#5a7c8f]/30 focus:border-[#5a7c8f] focus:bg-white transition-all text-slate-700 placeholder:text-slate-400 font-medium';
  
  const paddingStyles = icon ? 'pl-12 pr-4' : 'px-4';

  return (
    <div className="relative w-full">
      {icon && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
          {icon}
        </div>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        className={`${baseStyles} ${paddingStyles} ${className}`}
      />
    </div>
  );
};
