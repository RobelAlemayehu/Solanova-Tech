import React from 'react';

export function PropertyFormField({
  label,
  error,
  disabled,
  children,
}: {
  label: string;
  error?: string;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={disabled ? 'mb-5 opacity-70' : 'mb-5'}>
      <label className="block mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}

export function propertyInputClass(hasError?: boolean) {
  return `proplist-input ${hasError ? 'border-red-500/50' : ''}`.trim();
}
