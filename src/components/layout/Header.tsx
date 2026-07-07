import { motion } from 'framer-motion';
import { ScanLine, Moon, Sun, Settings, Info, Code2, Menu } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { Button } from '../ui/Button';

export function Header() {
  const theme = useAppStore((s) => s.theme);
  const toggleTheme = useAppStore((s) => s.toggleTheme);
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);
  const setNav = useAppStore((s) => s.setNav);

  return (
    <header className="sticky top-0 z-50 glass border-b border-[var(--color-border)]">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={toggleSidebar}
            className="lg:hidden shrink-0 h-9 w-9 grid place-items-center rounded-[var(--radius-control)] text-[var(--color-muted)] hover:bg-[color-mix(in_oklab,var(--color-text)_6%,transparent)]"
            aria-label="Toggle navigation"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="h-9 w-9 rounded-[10px] bg-[var(--color-primary)] grid place-items-center shadow-[var(--shadow-card)]">
              <ScanLine className="h-5 w-5 text-white" strokeWidth={2.25} />
            </div>
            <div className="leading-tight hidden sm:block">
              <p className="font-bold text-[15px] tracking-tight">ScanPro</p>
              <p className="text-[11px] text-[var(--color-muted)] -mt-0.5">Barcode Intelligence</p>
            </div>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
          {(['dashboard', 'scans', 'camera', 'reports'] as const).map((key) => (
            <button
              key={key}
              onClick={() => setNav(key)}
              className="px-3.5 py-2 rounded-[var(--radius-control)] text-sm font-medium text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-[color-mix(in_oklab,var(--color-text)_5%,transparent)] transition-colors duration-200 capitalize"
            >
              {key}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={toggleTheme}
            className="h-9 w-9 grid place-items-center rounded-[var(--radius-control)] text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-[color-mix(in_oklab,var(--color-text)_6%,transparent)] transition-colors duration-200"
            aria-label="Toggle dark mode"
          >
            {theme === 'light' ? <Moon className="h-[18px] w-[18px]" /> : <Sun className="h-[18px] w-[18px]" />}
          </motion.button>
          <button
            onClick={() => setNav('settings')}
            className="hidden sm:grid h-9 w-9 place-items-center rounded-[var(--radius-control)] text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-[color-mix(in_oklab,var(--color-text)_6%,transparent)] transition-colors duration-200"
            aria-label="Settings"
          >
            <Settings className="h-[18px] w-[18px]" />
          </button>
          <button
            onClick={() => setNav('help')}
            className="hidden sm:grid h-9 w-9 place-items-center rounded-[var(--radius-control)] text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-[color-mix(in_oklab,var(--color-text)_6%,transparent)] transition-colors duration-200"
            aria-label="About"
          >
            <Info className="h-[18px] w-[18px]" />
          </button>
          <Button
            variant="outline"
            size="sm"
            icon={<Code2 />}
            className="hidden sm:inline-flex"
            onClick={() => window.open('https://github.com', '_blank')}
          >
            GitHub
          </Button>
        </div>
      </div>
    </header>
  );
}
