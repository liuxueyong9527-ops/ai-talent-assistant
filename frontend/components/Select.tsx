"use client";

import { forwardRef } from "react";

const ChevronIcon = () => (
  <svg className="w-4 h-4 text-slate-500 dark:text-slate-400 pointer-events-none shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

export const Select = forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string }
>(function Select({ label, className = "", children, ...props }, ref) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          {...props}
          className={`
            w-full pl-4 pr-10 py-2.5
            border border-slate-200 dark:border-slate-600 rounded-xl
            bg-white dark:bg-slate-800
            text-slate-900 dark:text-slate-100
            focus:ring-2 focus:ring-cyan-500 focus:border-transparent
            hover:border-slate-300 dark:hover:border-slate-500
            transition cursor-pointer
            appearance-none
            [&>option]:bg-white [&>option]:text-slate-900
            dark:[&>option]:bg-slate-800 dark:[&>option]:text-slate-100
            ${className}
          `}
        >
          {children}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <ChevronIcon />
        </div>
      </div>
    </div>
  );
});
