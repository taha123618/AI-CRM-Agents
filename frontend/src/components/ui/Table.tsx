import React from 'react';
import { cn } from '@/lib/utils';

export function Table({ className, children, ...props }: React.HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="w-full overflow-x-auto rounded-none border border-[#3A4552]">
      <table className={cn('w-full text-left text-xs font-mono text-slate-300', className)} {...props}>
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ className, children, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead className={cn('bg-[#0B0C10] text-[10px] font-bold font-mono uppercase tracking-wider text-slate-400 border-b border-[#3A4552]', className)} {...props}>
      {children}
    </thead>
  );
}

export function TableBody({ className, children, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody className={cn('divide-y divide-[#3A4552]/60', className)} {...props}>
      {children}
    </tbody>
  );
}

export function TableRow({ className, children, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr className={cn('odd:bg-[#161D26] even:bg-[#1F2833] hover:bg-[#26313F] hover:outline hover:outline-1 hover:outline-[#39FF14] transition-none', className)} {...props}>
      {children}
    </tr>
  );
}

export function TableHead({ className, children, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th className={cn('px-3.5 py-2.5 font-bold font-mono text-slate-400 uppercase tracking-wider', className)} {...props}>
      {children}
    </th>
  );
}

export function TableCell({ className, children, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={cn('px-3.5 py-2.5 align-middle font-mono text-slate-200', className)} {...props}>
      {children}
    </td>
  );
}
