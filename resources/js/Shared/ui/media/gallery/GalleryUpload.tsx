// resources/js/Shared/ui/media/gallery/GalleryUpload.tsx
import { useRef, type ChangeEvent } from 'react';
import { ImagePlus } from 'lucide-react';
import { processFiles, type MediaError, type MediaItem, type MediaRules } from '../media.types';

interface GalleryUploadProps {
    title?: string;
    hint?: string;
    multiple?: boolean;
    rules?: Partial<MediaRules>;
    onUpload: (items: MediaItem[]) => void;
    onError?: (errors: MediaError[]) => void;
    className?: string;
}

const IMAGE_ACCEPT = ['png', 'jpg', 'jpeg', 'webp'];

export function GalleryUpload({
    title = 'Agregar fotos',
    hint = 'Haz clic para enviar imágenes (PNG, JPG, WEBP)',
    multiple = true,
    rules,
    onUpload,
    onError,
    className = '',
}: GalleryUploadProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const finalRules = { accept: IMAGE_ACCEPT, ...rules };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []);
        e.target.value = '';
        if (files.length === 0) return;

        const { items, errors } = processFiles(files, finalRules);
        if (items.length > 0) onUpload(items);
        if (errors.length > 0) onError?.(errors);
    };

    return (
        <div className={className}>
            <input
                ref={inputRef}
                type="file"
                multiple={multiple}
                accept={finalRules.accept.map((ext) => `.${ext}`).join(',')}
                className="hidden"
                onChange={handleChange}
            />
            <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="group flex w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-navy-700 bg-navy-900/50 px-4 py-4 text-slate-300 transition hover:border-teal-500 hover:bg-navy-900"
            >
                <ImagePlus className="mb-1 h-8 w-8 text-teal-400 transition-transform group-hover:scale-110" />
                <span className="text-sm font-semibold text-white">{title}</span>
                <span className="mt-1 text-[10px] text-slate-400">{hint}</span>
            </button>
        </div>
    );
}

export default GalleryUpload;