import React from 'react';
import { cn } from '@/lib/utils';

export function Table({ className, children, ...props }: React.HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-[#E9E6E0] dark:border-[#35322E] bg-white dark:bg-[#1D1B18] shadow-sm">
      <table className={cn('w-full text-left text-sm text-[#1A1917] dark:text-[#F5F3EE]', className)} {...props}>
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ className, children, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead className={cn('bg-[#FAF9F6] dark:bg-[#25231F] text-xs font-semibold uppercase tracking-wider text-[#5F5C56] dark:text-[#B9B5AD] border-b border-[#E9E6E0] dark:border-[#35322E]', className)} {...props}>
      {children}
    </thead>
  );
}

export function TableBody({ className, children, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody className={cn('divide-y divide-[#E9E6E0] dark:divide-[#35322E] bg-white dark:bg-[#1D1B18]', className)} {...props}>
      {children}
    </tbody>
  );
}

export function TableRow({ className, children, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr className={cn('hover:bg-[#F6F5F2] dark:hover:bg-[#25231F] transition-colors', className)} {...props}>
      {children}
    </tr>
  );
}

export function TableHead({ className, children, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th className={cn('px-4 py-3 font-medium text-[#5F5C56] dark:text-[#B9B5AD]', className)} {...props}>
      {children}
    </th>
  );
}

export function TableCell({ className, children, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={cn('px-4 py-3 align-middle text-[#1A1917] dark:text-[#F5F3EE]', className)} {...props}>
      {children}
    </td>
  );
}
