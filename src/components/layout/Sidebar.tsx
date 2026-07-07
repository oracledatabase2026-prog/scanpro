import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  ScanLine,
  Camera,
  FileSpreadsheet,
  History,
  Settings,
  HelpCircle,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { cx } from '../../utils/format';
import type { NavKey } from '../../types';

const NAV_ITEMS: { key: NavKey; label: string; icon: typeof LayoutDashboard }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'scans', label: 'Scans', icon: ScanLine },
  { key: 'camera', label: 'Live Camera', icon: Camera },
  { key: 'reports', label: 'Reports', icon: FileSpreadsheet },
  { key: 'history', label: 'History', icon: History },
  { key: 'settings', label: 'Settings', icon: Settings },
  { key: 'help', label: 'Help', icon: HelpCircle },
];

export function Sidebar() {
  const nav = useAppStore((s) => s.nav);
  const setNav = useAppStore((s) => s.setNav);
  const collapsed = useAppStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);

  return (
    <motion.aside
      animate={{ width: collapsed ? 76 : 232 }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      className="hidden lg:flex flex-col shrink-0 border-r border-[var(--color-border)] bg-[var(--color-card)] h-[calc(100vh-4rem)] sticky top-16 py-5"
    >
      <nav className="flex-1 flex flex-col gap-1 px-3">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = nav === item.key;
          return (
            <button
              key={item.key}
              onClick={() => setNav(item.key)}
              className={cx(
                'group relative flex items-center gap-3 rounded-[var(--radius-control)] px-3 py-2.5 text-sm font-medium transition-colors duration-200',
                active
                  ? 'bg-[color-mix(in_oklab,var(--color-primary)_10%,transparent)] text-[var(--color-primary)]'
                  : 'text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-[color-mix(in_oklab,var(--color-text)_5%,transparent)]'
              )}
              title={collapsed ? item.label : undefined}
            >
              {active && (
                <motion.span
                  layoutId="sidebar-active"
                  className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-full bg-[var(--color-primary)]"
                  transition={{ duration: 0.25 }}
                />
              )}
              <Icon className="h-[18px] w-[18px] shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </button>
          );
        })}
      </nav>
      <div className="px-3 pt-2 border-t border-[var(--color-border)]">
        <button
          onClick={toggleSidebar}
          className="flex items-center gap-3 rounded-[var(--radius-control)] px-3 py-2.5 text-sm font-medium text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-[color-mix(in_oklab,var(--color-text)_5%,transparent)] w-full transition-colors duration-200"
        >
          {collapsed ? <ChevronsRight className="h-[18px] w-[18px]" /> : <ChevronsLeft className="h-[18px] w-[18px]" />}
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </motion.aside>
  );
}
