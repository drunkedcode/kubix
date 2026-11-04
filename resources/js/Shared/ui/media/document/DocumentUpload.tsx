// resources/js/Shared/ui/media/document/DocumentUpload.tsx
import { useRef, type ChangeEvent } from 'react';
import { FileText } from 'lucide-react';
import { processFiles, type MediaError, type MediaItem, type MediaRules } from '../media.types';

interface DocumentUploadProps {
    title?: string;
    hint?: string;
    multiple?: boolean;
    rules?: Partial<MediaRules>;
    onUpload: (items: MediaItem[]) => void;
    onError?: (errors: MediaError[]) => void;
    className?: string;
}

export function DocumentUpload({
    title = 'Enviar documentos',
    hint = 'Haz clic para seleccionar archivos',
    multiple = true,
    rules,
    onUpload,
    onError,
    className = '',
}: DocumentUploadProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    const accept = (rules?.accept ?? ['pdf', 'doc', 'docx', 'png', 'jpg', 'jpeg'])
        .map((ext) => `.${ext}`)
        .join(',');

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []);
        e.target.value = '';
        if (files.length === 0) return;

        const { items, errors } = processFiles(files, rules);
        if (items.length > 0) onUpload(items);
        if (errors.length > 0) onError?.(errors);
    };

    return (
        <div className={className}>
            <input
                ref={inputRef}
                type="file"
                multiple={multiple}
                accept={accept}
                className="hidden"
                onChange={handleChange}
            />
            <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="group flex w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-navy-700 bg-navy-900/50 px-4 py-3 text-slate-300 transition hover:border-teal-500 hover:bg-navy-900"
            >
                <FileText className="mb-1 h-7 w-7 text-teal-400 transition-transform group-hover:scale-110" />
                <span className="text-xs font-semibold text-white">{title}</span>
                <span className="mt-0.5 text-[10px] text-slate-400">{hint}</span>
            </button>
        </div>
    );
}

export default DocumentUpload;