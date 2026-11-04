// resources/js/Shared/ui/media/MediaLightbox.tsx
import { useEffect } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { MediaItem } from './media.types';

interface MediaLightboxProps {
    items: MediaItem[];
    activeIndex: number | null;
    onClose: () => void;
    onNavigate: (index: number) => void;
}

const IMAGE_EXT = ['png', 'jpg', 'jpeg', 'webp', 'gif'];

const extOf = (item: MediaItem) =>
    (item.fileType ?? item.title.split('.').pop() ?? '').toLowerCase();

export function MediaLightbox({ items, activeIndex, onClose, onNavigate }: MediaLightboxProps) {
    const item = activeIndex !== null ? items[activeIndex] : undefined;
    const hasNext = activeIndex !== null && activeIndex < items.length - 1;
    const hasPrev = activeIndex !== null && activeIndex > 0;

    useEffect(() => {
        if (activeIndex === null) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowRight' && hasNext) onNavigate(activeIndex + 1);
            if (e.key === 'ArrowLeft' && hasPrev) onNavigate(activeIndex - 1);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [activeIndex, hasNext, hasPrev, onClose, onNavigate]);

    if (activeIndex === null || !item) return null;

    const ext = extOf(item);
    const isImage = IMAGE_EXT.includes(ext);
    const isPdf = ext === 'pdf';

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-label={item.title}
            onClick={onClose}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
        >
            <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar"
                className="absolute right-4 top-4 z-10 cursor-pointer rounded-full border border-navy-700 bg-navy-900/80 p-2.5 text-white transition hover:bg-navy-800"
            >
                <X className="h-5 w-5" />
            </button>

            {hasPrev && (
                <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onNavigate(activeIndex - 1); }}
                    aria-label="Anterior"
                    className="absolute left-4 z-10 cursor-pointer rounded-full border border-navy-700 bg-navy-900/80 p-3 text-white transition hover:bg-navy-800"
                >
                    <ChevronLeft className="h-5 w-5" />
                </button>
            )}

            {hasNext && (
                <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onNavigate(activeIndex + 1); }}
                    aria-label="Siguiente"
                    className="absolute right-4 z-10 cursor-pointer rounded-full border border-navy-700 bg-navy-900/80 p-3 text-white transition hover:bg-navy-800"
                >
                    <ChevronRight className="h-5 w-5" />
                </button>
            )}

            <div
                onClick={(e) => e.stopPropagation()}
                className="relative flex max-h-[90vh] w-full max-w-4xl flex-col items-center rounded-2xl border border-navy-800 bg-navy-950 p-6 shadow-2xl"
            >
                <div className="mb-4 flex w-full items-center justify-between gap-4">
                    <h3 className="max-w-[80%] truncate font-semibold text-white">{item.title}</h3>
                    <span className="shrink-0 text-xs text-slate-400">
                        {activeIndex + 1} de {items.length}
                    </span>
                </div>

                <div className="flex w-full flex-1 items-center justify-center overflow-hidden">
                    {isImage ? (
                        <img
                            src={item.url}
                            alt={item.title}
                            className="max-h-[70vh] max-w-full rounded-lg object-contain"
                        />
                    ) : isPdf ? (
                        <iframe
                            src={item.url}
                            title={item.title}
                            className="h-[70vh] w-full rounded-lg border border-navy-800 bg-white"
                        />
                    ) : (
                        <div className="flex h-[50vh] w-full flex-col items-center justify-center rounded-lg border border-navy-800 bg-navy-900/50 text-slate-400">
                            <p className="mb-4 text-sm">
                                Vista previa no disponible para este formato ({item.fileType})
                            </p>
                            <a
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="rounded-lg bg-teal-500 px-4 py-2 text-sm font-bold text-navy-950 transition-colors hover:bg-teal-400"
                            >
                                Descargar / Abrir archivo
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default MediaLightbox;