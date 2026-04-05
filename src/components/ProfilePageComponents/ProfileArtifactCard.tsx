import React from 'react';
import { Card } from '@/components/ui/card';
import type { ProfileInventoryArtifact } from '@/types/types';

function getGradientClassByLevel(level: number): string {
    const l = level || 1;
    if (l < 15) return 'bg-gradient-to-br from-amber-500/80 to-transparent/50';
    if (l < 35) return 'bg-gradient-to-br from-pink-500/30 at-pink-500/10 to-transparent/50';
    if (l < 55) return 'bg-gradient-to-br from-purple-500/30 at-purple-500/10 to-transparent/50';
    if (l < 75) return 'bg-gradient-to-br from-blue-500/30 at-blue-500/10 to-transparent/50';
    return 'bg-gradient-to-br from-white/30 at-white/10 to-transparent/50';
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
                    <>
                        <img
                            src={previewUrl}
                            alt=""
                            className={`w-24 h-24 object-contain ${
                                isOwned ? '' : 'grayscale brightness-[0.72] contrast-[0.92]'
                            }`}
                        />
                        {!isOwned && (
                            <>
                                <div
                                    className="absolute inset-0 rounded-lg bg-zinc-500/25 pointer-events-none"
                                    aria-hidden
                                />
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-black/45 text-white shadow-lg ring-1 ring-white/20">
                                        <i className="fa-solid fa-lock text-lg" />
                                    </span>
                                </div>
                            </>
                        )}
                    </>
                ) : (
                    <div className="relative w-24 h-24 rounded-lg bg-primary-700/50 flex items-center justify-center">
                        <i
                            className={`fa-solid fa-gem text-2xl text-amber-300/90 ${
                                isOwned ? '' : 'opacity-40 grayscale'
                            }`}
                        />
                        {!isOwned && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-black/45 text-white shadow-lg ring-1 ring-white/20">
                                    <i className="fa-solid fa-lock text-lg" />
                                </span>
                            </div>
                        )}
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
