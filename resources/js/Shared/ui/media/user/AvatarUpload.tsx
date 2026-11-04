// resources/js/Shared/ui/media/user/AvatarUpload.tsx
import { useEffect, useRef, type ChangeEvent } from 'react';
import { Camera } from 'lucide-react';
import Avatar from './Avatar';
import { processFiles, type MediaError } from '../media.types';

interface AvatarUploadProps {
    name: string;
    previewUrl?: string | null; // controlado por el padre
    onChange: (file: File, previewUrl: string) => void;
    onError?: (errors: MediaError[]) => void;
    maxSizeMB?: number;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    roundedCorners?: boolean;
}

export function AvatarUpload({
    name,
    previewUrl = null,
    onChange,
    onError,
    maxSizeMB = 2,
    size = 'xl',
    roundedCorners = false,
}: AvatarUploadProps) {
    const lastBlob = useRef<string | null>(null);

    // Libera el último blob al desmontar
    useEffect(() => () => {
        if (lastBlob.current) URL.revokeObjectURL(lastBlob.current);
    }, []);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file) return;

        const { items, errors } = processFiles([file], {
            maxSizeMB,
            accept: ['png', 'jpg', 'jpeg', 'webp'],
        });
        if (errors.length > 0) return onError?.(errors);

        if (lastBlob.current) URL.revokeObjectURL(lastBlob.current);
        lastBlob.current = items[0].url;
        onChange(file, items[0].url);
    };

    return (
        <div className="flex justify-center">
            <label
                aria-label="Cambiar foto"
                className="group relative block cursor-pointer"
            >
                <Avatar name={name} avatarUrl={previewUrl} size={size} roundedCorners={roundedCorners} />

                <div
                    className={`absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity duration-200 group-hover:opacity-100 ${
                        roundedCorners ? 'rounded-xl' : 'rounded-full'
                    }`}
                >
                    <Camera className="h-8 w-8 text-white" />
                </div>

                <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleChange}
                    className="hidden"
                />
            </label>
        </div>
    );
}

export default AvatarUpload;