import { motion } from 'framer-motion';
import { Moon, Sun, Sliders } from 'lucide-react';
import { Card, CardHeader, CardBody, Divider } from '../components/ui/Primitives';
import { useAppStore } from '../store/useAppStore';
import { ALL_FORMATS, FORMAT_LABELS, cx } from '../utils/format';

export function SettingsPage() {
  const theme = useAppStore((s) => s.theme);
  const toggleTheme = useAppStore((s) => s.toggleTheme);
  const settings = useAppStore((s) => s.settings);
  const updateSettings = useAppStore((s) => s.updateSettings);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-8 space-y-6 max-w-3xl"
    >
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-[var(--color-muted)] mt-1">Customize appearance and default scan behavior</p>
      </div>

      <Card>
        <CardHeader>
          <h2 className="font-semibold">Appearance</h2>
        </CardHeader>
        <CardBody className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Theme</p>
            <p className="text-xs text-[var(--color-muted)] mt-0.5">Switch between light and dark mode</p>
          </div>
          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 rounded-[var(--radius-control)] border border-[var(--color-border)] px-3.5 py-2 text-sm font-medium hover:bg-[color-mix(in_oklab,var(--color-text)_5%,transparent)] transition-colors"
          >
            {theme === 'light' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            {theme === 'light' ? 'Light' : 'Dark'}
          </button>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-semibold flex items-center gap-2">
            <Sliders className="h-4 w-4" /> Default Scan Behavior
          </h2>
        </CardHeader>
        <CardBody>
          <div className="grid sm:grid-cols-3 gap-3">
            {[
              { key: 'autoEnhance' as const, label: 'Auto-enhance contrast' },
              { key: 'deskew' as const, label: 'Deskew rotated scans' },
              { key: 'multiAttempt' as const, label: 'Multi-attempt decoding' },
            ].map((opt) => (
              <label
                key={opt.key}
                className="flex items-center gap-2.5 rounded-[var(--radius-control)] border border-[var(--color-border)] px-3 py-2.5 cursor-pointer text-sm"
              >
                <input
                  type="checkbox"
                  checked={settings[opt.key]}
                  onChange={(e) => updateSettings({ [opt.key]: e.target.checked })}
                  className="h-4 w-4 accent-[var(--color-primary)]"
                />
                {opt.label}
              </label>
            ))}
          </div>
          <Divider className="my-4" />
          <p className="text-xs font-semibold text-[var(--color-muted)] mb-2">Preferred formats (leave empty to detect all)</p>
          <div className="flex flex-wrap gap-2">
            {ALL_FORMATS.map((fmt) => (
              <button
                key={fmt}
                onClick={() =>
                  updateSettings({
                    formats: settings.formats.includes(fmt as any)
                      ? settings.formats.filter((f) => f !== fmt)
                      : [...settings.formats, fmt as any],
                  })
                }
                className={cx(
                  'text-xs font-medium px-2.5 py-1.5 rounded-[var(--radius-pill)] border transition-colors duration-200',
                  settings.formats.includes(fmt as any)
                    ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white'
                    : 'border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-text)]'
                )}
              >
                {FORMAT_LABELS[fmt]}
              </button>
            ))}
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
}
