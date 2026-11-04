// resources/js/Shared/ui/media/user/Avatar.tsx
import { useState } from 'react';

export interface AvatarProps {
    name: string;
    avatarUrl?: string | null;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    sizeClass?: string;
    roundedCorners?: boolean;
}

const SIZE_MAP = {
    xs: 'h-6 w-6 text-[10px]',
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
    xl: 'h-35 w-35 text-4xl',
} as const;

export function Avatar({
    name,
    avatarUrl,
    size = 'md',
    sizeClass,
    roundedCorners = false,
}: AvatarProps) {
    const [failedUrl, setFailedUrl] = useState<string | null>(null);
    const showImage = !!avatarUrl && failedUrl !== avatarUrl;

    return (
        <div
            className={`${sizeClass ?? SIZE_MAP[size]} flex shrink-0 items-center justify-center overflow-hidden border border-teal-500/30 bg-navy-800 ${
                roundedCorners ? 'rounded-xl' : 'rounded-full'
            }`}
        >
            {showImage ? (
                <img
                    src={avatarUrl}
                    alt={name}
                    className="h-full w-full object-cover"
                    onError={() => setFailedUrl(avatarUrl)}
                />
            ) : (
                <span className="font-bold text-teal-300">
                    {name ? name.charAt(0).toUpperCase() : '?'}
                </span>
            )}
        </div>
    );
}

export default Avatar;