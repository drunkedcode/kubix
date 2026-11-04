// resources/js/Shared/ui/media/media.types.ts

export interface MediaItem {
    id: string;
    title: string;
    url: string;            // URL de visualización o descarga
    thumbnailUrl?: string;  // Solo imágenes (reutiliza la misma URL)
    fileType?: string;      // ej: 'PDF', 'PNG'
    fileSize?: string;      // ej: '2.40 MB'
    rawFile?: File;         // Archivo original si se acaba de seleccionar
}

export interface MediaRules {
    maxSizeMB: number;
    accept: string[]; // extensiones en minúscula, sin punto: ['pdf', 'png']
}

export interface MediaError {
    fileName: string;
    message: string;
}

export interface MediaResult {
    items: MediaItem[];
    errors: MediaError[];
}

export const DEFAULT_RULES: MediaRules = {
    maxSizeMB: 5,
    accept: ['pdf', 'doc', 'docx', 'png', 'jpg', 'jpeg'],
};

const extensionOf = (file: File) => file.name.split('.').pop()?.toLowerCase() ?? '';

// Crea un item a partir de un File (una sola URL blob por archivo)
export function createMediaItem(file: File): MediaItem {
    const url = URL.createObjectURL(file);
    return {
        id: crypto.randomUUID(),
        title: file.name,
        url,
        thumbnailUrl: file.type.startsWith('image/') ? url : undefined,
        fileType: extensionOf(file).toUpperCase() || 'FILE',
        fileSize: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        rawFile: file,
    };
}

// Valida tipo y peso; devuelve los items válidos y los errores por archivo
export function processFiles(files: File[], rules: Partial<MediaRules> = {}): MediaResult {
    const { maxSizeMB, accept } = { ...DEFAULT_RULES, ...rules };
    const result: MediaResult = { items: [], errors: [] };

    for (const file of files) {
        if (!accept.includes(extensionOf(file))) {
            result.errors.push({
                fileName: file.name,
                message: `Tipo no permitido (${accept.join(', ').toUpperCase()})`,
            });
        } else if (file.size > maxSizeMB * 1024 * 1024) {
            result.errors.push({
                fileName: file.name,
                message: `Supera el máximo de ${maxSizeMB} MB`,
            });
        } else {
            result.items.push(createMediaItem(file));
        }
    }

    return result;
}

// Libera la URL blob para evitar fugas de memoria
export function revokeMediaItem(item: MediaItem) {
    if (item.url.startsWith('blob:')) URL.revokeObjectURL(item.url);
}