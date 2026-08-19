import React, { createContext, useContext, useState } from 'react';
import { cn } from '@/lib/utils';

interface TabsContextType {
  activeTab: string;
  setActiveTab: (id: string) => void;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

export interface TabsProps {
  defaultValue: string;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  children: React.ReactNode;
}

export function Tabs({ defaultValue, value, onValueChange, className, children }: TabsProps) {
  const [selectedTab, setSelectedTab] = useState(defaultValue);
  const activeTab = value !== undefined ? value : selectedTab;

  const handleTabChange = (id: string) => {
    if (value === undefined) {
      setSelectedTab(id);
    }
    onValueChange?.(id);
  };

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab: handleTabChange }}>
      <div className={cn('space-y-4', className)}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 p-1 rounded-xl bg-[#F1F0EC] dark:bg-[#25231F] border border-[#E9E6E0] dark:border-[#35322E]',
        className
      )}
    >
      {children}
    </div>
  );
}

export function TabsTrigger({
  value,
  className,
  children,
  icon,
}: {
  value: string;
  className?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}) {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('TabsTrigger must be used within Tabs');

  const isActive = ctx.activeTab === value;

  return (
    <button
      type="button"
      onClick={() => ctx.setActiveTab(value)}
      className={cn(
        'inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors duration-150',
        isActive
          ? 'bg-[#1A1917] dark:bg-[#F5F3EE] text-white dark:text-[#141311] shadow-sm'
          : 'text-[#5F5C56] dark:text-[#B9B5AD] hover:text-[#1A1917] dark:hover:text-[#F5F3EE] hover:bg-[#EAE8E3] dark:hover:bg-[#302D28]',
        className
      )}
    >
      {icon}
      <span>{children}</span>
    </button>
  );
}

export function TabsContent({
  value,
  className,
  children,
}: {
  value: string;
  className?: string;
  children: React.ReactNode;
}) {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('TabsContent must be used within Tabs');

  if (ctx.activeTab !== value) return null;

  return <div className={cn('animate-in fade-in duration-150', className)}>{children}</div>;
}
