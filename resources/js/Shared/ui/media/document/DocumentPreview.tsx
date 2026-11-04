import { useState } from "react";
import { FileIcon } from "../FileIcon";
import { MediaOverlay } from "../MediaOverlay";
import { MediaLightbox } from "../MediaLightbox"; 
import { revokeMediaItem, type MediaItem } from "../media.types";

interface DocumentPreviewProps {
    items: MediaItem[];
    onRemove: (id: string) => void;
    className?: string;
}

export function DocumentPreview({ items, onRemove, className = "" }: DocumentPreviewProps) {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    if (items.length === 0) return null;

    return (
        <>
            <div className={`flex flex-col gap-2 ${className}`}>
                {items.map((item, index) => (
                    <div
                        key={item.id}
                        className="group relative flex items-center gap-3 rounded-lg border border-navy-700 bg-navy-950 px-3 py-2.5"
                    >
                        <FileIcon fileName={item.title} className="h-5 w-5 shrink-0" />

                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm text-white">{item.title}</p>
                            <p className="text-xs text-slate-500">{item.fileSize ?? item.fileType}</p>
                        </div>

                        <MediaOverlay
                            actions={[
                                {
                                    icon: "view",
                                    label: "Ver documento",
                                    onClick: () => setActiveIndex(index),
                                },
                                {
                                    icon: "delete",
                                    label: "Eliminar documento",
                                    onClick: () => {
                                        revokeMediaItem(item);
                                        onRemove(item.id);
                                    },
                                },
                            ]}
                        />
                    </div>
                ))}
            </div>

            {activeIndex !== null && (
                <MediaLightbox
                    items={items}
                    activeIndex={activeIndex}
                    onClose={() => setActiveIndex(null)}
                    onNavigate={setActiveIndex}
                />
            )}
        </>
    );
}

export default DocumentPreview;