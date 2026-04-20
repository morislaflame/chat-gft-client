import React from 'react';
import { Card } from '@/components/ui/card';
import type { ProfileInventoryArtifact } from '@/types/types';

/**
 * Верхний градиент карточки — тот же паттерн, что у {@link BoxCard}:
 * `bg-gradient-to-b from-* to-transparent`, высота слоя и opacity задаются снаружи.
 */
function artifactCardGradientClass(boostType: string | undefined): string {
    switch (boostType) {
        case 'WEAPON':
            return 'bg-gradient-to-b from-red-500 to-transparent';
        case 'ARMOR':
            return 'bg-gradient-to-b from-blue-500 to-transparent';
        case 'TRINKET':
            return 'bg-gradient-to-b from-purple-500 to-transparent';
        case 'KEY':
            return 'bg-gradient-to-b from-amber-400 to-transparent';
        case 'COMPANION':
            return 'bg-gradient-to-b from-fuchsia-500 to-transparent';
        default:
            return 'bg-gradient-to-b from-purple-500 to-transparent';
    }
}

export type ProfileArtifactCardProps = {
    artifact: ProfileInventoryArtifact;
    displayName: string;
    ownedQty: number;
    isFound: boolean;
    onOpenDetail: () => void;
};

const ProfileArtifactCard: React.FC<ProfileArtifactCardProps> = ({
    artifact,
    displayName,
    ownedQty: _ownedQty,
    isFound,
    onOpenDetail,
}) => {
    const previewUrl = artifact.media?.url;
    const previewMime = artifact.media?.mimeType ?? '';
    const isPreviewImage = Boolean(previewUrl && previewMime.startsWith('image/'));
    const isDiscovered = isFound;
    const gradientClass = artifactCardGradientClass(artifact.boostType);

    return (
        <Card
            role="button"
            tabIndex={0}
            onClick={onOpenDetail}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onOpenDetail();
                }
            }}
            className="relative flex-shrink-0 w-[140px] h-fit p-4 flex flex-col items-center quest-item overflow-hidden cursor-pointer hover:bg-primary-700/50 transition-colors"
        >
            {isDiscovered && <div aria-hidden className="pointer-events-none absolute w-full inset-0 rounded-lg">
                <div
                    className={`absolute -top-0 -left-0 h-[50%] w-full opacity-20 ${gradientClass}`}
                />
            </div>}
            <div className="mb-4 flex items-center justify-center relative w-28 h-28 z-[1]">
                {isPreviewImage ? (
                    <>
                        <img
                            src={previewUrl}
                            alt=""
                            className={`w-28 h-28 object-contain ${
                                isDiscovered ? '' : 'grayscale brightness-[0.72] contrast-[0.92]'
                            }`}
                        />
                        {!isDiscovered && (
                            <>
                                <div
                                    className="absolute inset-0 rounded-lg pointer-events-none"
                                    aria-hidden
                                />
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-black/45 text-white shadow-lg ring-1 ring-white/20">
                                        <i className="fa-solid fa-lock text-2xl" />
                                    </span>
                                </div>
                            </>
                        )}
                    </>
                ) : (
                    <div className="relative w-28 h-28 rounded-lg bg-primary-700/50 flex items-center justify-center">
                        <i
                            className={`fa-solid fa-gem text-2xl text-amber-300/90 ${
                                isDiscovered ? '' : 'opacity-40 grayscale'
                            }`}
                        />
                        {!isDiscovered && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-black/45 text-white shadow-lg ring-1 ring-white/20">
                                    <i className="fa-solid fa-lock text-2xl" />
                                </span>
                            </div>
                        )}
                    </div>
                )}
            </div>
            <div className="text-center flex-1 relative z-[1] w-full px-0.5">
                <div className="text-xs font-semibold line-clamp-3 leading-tight text-zinc-100">{displayName}</div>
            </div>
        </Card>
    );
};

export default ProfileArtifactCard;
