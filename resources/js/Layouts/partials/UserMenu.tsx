import { useEffect, useRef, useState } from 'react';
import { ChevronDown, User, LogOut } from 'lucide-react';

interface UserMenuProps {
    name?: string;
    role?: string;
    collapsed?: boolean;
    profileHref?: string;
    onLogout?: () => void;
}

export default function UserMenu({
    name = 'Usuario Demo',
    role = 'Administrador',
    collapsed = false,
    profileHref = '#',
    onLogout,
}: UserMenuProps) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const initial = name.charAt(0).toUpperCase();

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                title={collapsed ? name : undefined}
                className={`flex w-full items-center rounded-lg py-2 transition-colors hover:bg-brand/5 ${
                    collapsed ? 'justify-center px-2' : 'gap-3 px-2'
                }`}
            >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand-hover text-sm font-bold text-brand-fg shadow-md shadow-brand/20">
                    {initial}
                </div>

                {!collapsed && (
                    <>
                        <div className="min-w-0 flex-1 text-left">
                            <p className="truncate text-sm font-medium text-white">{name}</p>
                            <p className="truncate text-xs text-slate-400">{role}</p>
                        </div>
                        <ChevronDown
                            className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${
                                open ? 'rotate-180' : ''
                            }`}
                        />
                    </>
                )}
            </button>

            {open && (
                <div
                    className={`absolute bottom-full z-20 mb-2 w-52 rounded-xl border border-sidebar-line bg-sidebar p-1.5 shadow-xl shadow-black/50 ${
                        collapsed ? 'left-full ml-2' : 'left-0'
                    }`}
                >
                    <a
                        href={profileHref}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-300 transition-colors hover:bg-brand/10 hover:text-brand"
                    >
                        <User className="h-4 w-4" />
                        Mi perfil
                    </a>
                    <button
                        type="button"
                        onClick={onLogout}
                        className="mt-0.5 flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-rose-400 transition-colors hover:bg-rose-500/10 hover:text-rose-300"
                    >
                        <LogOut className="h-4 w-4" />
                        Salir
                    </button>
                </div>
            )}
        </div>
    );
}