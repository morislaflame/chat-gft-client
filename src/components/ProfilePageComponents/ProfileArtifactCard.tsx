import React from 'react';
import { Card } from '@/components/ui/card';
import type { ProfileInventoryArtifact } from '@/types/types';

function getGradientClassByLevel(level: number): string {
    const l = level || 1;
    if (l < 15) return 'bg-gradient-to-b from-red-500 to-transparent';
    if (l < 35) return 'bg-gradient-to-b from-pink-500 to-transparent';
    if (l < 55) return 'bg-gradient-to-b from-purple-500 to-transparent';
    if (l < 75) return 'bg-gradient-to-b from-blue-500 to-transparent';
    return 'bg-gradient-to-b from-white to-transparent';
}

export type ProfileArtifactCardProps = {
    artifact: ProfileInventoryArtifact;
    displayName: string;
    ownedQty: number;
    onOpenDetail: () => void;
};

const ProfileArtifactCard: React.FC<ProfileArtifactCardProps> = ({
    artifact,
    displayName,
    ownedQty,
    onOpenDetail,
}) => {
    const previewUrl = artifact.media?.url;
    const previewMime = artifact.media?.mimeType ?? '';
    const isPreviewImage = Boolean(previewUrl && previewMime.startsWith('image/'));
    const isOwned = ownedQty > 0;
    const gradientClass = getGradientClassByLevel(artifact.level);

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
            className="relative flex-shrink-0 w-[140px] p-3 flex flex-col items-center quest-item overflow-hidden border border-primary-600/40 cursor-pointer hover:bg-primary-700/50 transition-colors"
        >
            <div aria-hidden className="pointer-events-none absolute w-full inset-0 rounded-lg">
                <div className={`absolute -top-0 -left-0 h-[50%] w-full opacity-20 ${gradientClass}`} />
            </div>
            <div className="mb-2 flex items-center justify-center relative w-24 h-24 z-[1]">
                {isPreviewImage ? (
                    <img
                        src={previewUrl}
                        alt=""
                        className={`w-24 h-24 object-contain ${isOwned ? '' : 'brightness-0'}`}
                    />
                ) : (
                    <div
                        className={`w-24 h-24 rounded-lg bg-primary-700/50 flex items-center justify-center ${
                            isOwned ? '' : 'opacity-40'
                        }`}
                    >
                        <i className="fa-solid fa-gem text-2xl text-amber-300/90" />
                    </div>
                )}
            </div>
            <div className="text-center flex-1 min-h-[2.75rem] relative z-[1] w-full px-0.5">
                <div className="text-xs font-semibold line-clamp-3 leading-tight text-zinc-100">{displayName}</div>
            </div>
            {isOwned && (
                <div className="mt-1 text-[10px] font-bold text-amber-400/90 bg-amber-500/15 rounded-full px-2 py-0.5 relative z-[1]">
                    ×{ownedQty}
                </div>
            )}
        </Card>
    );
};

export default ProfileArtifactCard;
