// resources/js/Shared/ui/media/document/DocumentListBox.tsx
import { FileText, Download, Plus } from 'lucide-react';

export interface DocumentItem {
    id: string | number;
    title: string;
    fileType: string;
    fileSize: string;
    downloadUrl?: string;
    onDownload?: () => void;
}

export interface DocumentListBoxProps {
    documents: DocumentItem[];
    title?: string;
    emptyLabel?: string;
    addLabel?: string;
    onAddDocument?: () => void;
    maxHeight?: string;
    className?: string;
}

export function DocumentListBox({
    documents,
    title = 'Documentos',
    emptyLabel = 'No hay documentos registrados.',
    addLabel = 'Agregar',
    onAddDocument,
    maxHeight = 'max-h-72',
    className = '',
}: DocumentListBoxProps) {
    return (
        <div className={`flex flex-col gap-4 rounded-xl border border-navy-800 bg-navy-900 p-5 text-white ${className}`}>
            <div className="flex items-center justify-between border-b border-navy-800 pb-3">
                <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-teal-500/10 p-2 text-teal-300">
                        <FileText className="h-5 w-5" />
                    </div>
                    <h3 className="text-base font-semibold tracking-wide">{title}</h3>
                </div>

                {onAddDocument && (
                    <button
                        type="button"
                        onClick={onAddDocument}
                        className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-teal-500 px-3 py-2 text-xs font-bold text-navy-950 transition-colors hover:bg-teal-400"
                    >
                        <Plus className="h-4 w-4" />
                        {addLabel}
                    </button>
                )}
            </div>

            <div className={`flex flex-col gap-2.5 overflow-y-auto pr-1 ${maxHeight}`}>
                {documents.length === 0 && (
                    <p className="py-8 text-center text-xs text-slate-500">{emptyLabel}</p>
                )}

                {documents.map((doc) => (
                    <div
                        key={doc.id}
                        className="flex items-center justify-between gap-4 rounded-lg border border-navy-800 bg-navy-950/60 p-3 transition-colors hover:border-navy-700"
                    >
                        <div className="flex min-w-0 items-center gap-3">
                            <div className="shrink-0 rounded-lg bg-navy-800 p-2.5 text-slate-300">
                                <FileText className="h-5 w-5" />
                            </div>
                            <div className="min-w-0">
                                <h4 className="truncate text-xs font-bold text-white">{doc.title}</h4>
                                <p className="mt-0.5 text-[11px] text-slate-400">
                                    <span className="font-semibold uppercase text-slate-300">{doc.fileType}</span> • {doc.fileSize}
                                </p>
                            </div>
                        </div>

                        <a
                            href={doc.downloadUrl ?? '#'}
                            download
                            title="Descargar documento"
                            aria-label={`Descargar ${doc.title}`}
                            onClick={(e) => {
                                if (doc.onDownload) {
                                    e.preventDefault();
                                    doc.onDownload();
                                }
                            }}
                            className="shrink-0 cursor-pointer rounded-lg border border-navy-700 p-2 text-slate-300 transition-colors hover:bg-navy-800 hover:text-teal-300"
                        >
                            <Download className="h-4 w-4" />
                        </a>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default DocumentListBox;