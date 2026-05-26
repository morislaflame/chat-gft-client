import React from 'react';
import type { ProfileInventoryCompanion } from '@/types/types';

type ProfileStoryCompanionSectionProps = {
    companion: ProfileInventoryCompanion;
    title: string;
    ownedLabel: string;
    lockedLabel: string;
    name: string;
    description?: string | null;
};

const ProfileStoryCompanionSection: React.FC<ProfileStoryCompanionSectionProps> = ({
    companion,
    title,
    ownedLabel,
    lockedLabel,
    name,
    description,
}) => {
    const mediaUrl = companion.media?.url;
    const mimeType = companion.media?.mimeType ?? '';
    const isImage = Boolean(mediaUrl && mimeType.startsWith('image/'));
    const owned = companion.owned;

    return (
        <section
            className={`rounded-2xl p-4 card-silver-border`}
            aria-label={title}
        >
            <div className="mb-3 flex items-center justify-between gap-2">
                <p className="text-sm font-semibold uppercase tracking-wide text-white">{title}</p>
                <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        owned
                            ? 'bg-emerald-500/15 text-emerald-300'
                            : 'bg-zinc-700/60 text-zinc-400'
                    }`}
                >
                    {owned ? ownedLabel : lockedLabel}
                </span>
            </div>

            <div className="flex items-start gap-4">
                <div
                    className={`flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl btn-default-silver-border ${
                        owned ? 'bg-primary-800' : 'bg-primary-700/50'
                    }`}
                >
                    {isImage ? (
                        <img src={mediaUrl} alt={name} className="h-full w-full object-contain" />
                    ) : (
                        <i className="fa-solid fa-paw text-2xl text-secondary-gradient" />
                    )}
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-base font-semibold text-white">{name}</p>
                    {description ? (
                        <p className="mt-1 text-sm leading-relaxed text-zinc-400">{description}</p>
                    ) : null}
                </div>
            </div>
        </section>
    );
};

export default ProfileStoryCompanionSection;
