import { Moon, Sun } from 'lucide-react';
import { useThemeStore } from '../store/useThemeStore';

export default function ThemeToggle() {
    const mode = useThemeStore((s) => s.mode);
    const toggle = useThemeStore((s) => s.toggle);
    const isDark = mode === 'dark';

    return (
        <button
            type="button"
            onClick={toggle}
            aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            title={isDark ? 'Modo claro' : 'Modo oscuro'}
            className="cursor-pointer rounded-xl border border-line p-2.5 text-muted transition-colors hover:bg-surface hover:text-brand"
        >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
    );
}
