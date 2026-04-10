import React, { useMemo } from 'react';
import type { ProfileInventoryArtifact, ProfileInventoryStory } from '@/types/types';
import ArtifactLevelSection from './ArtifactLevelSection';
import { buildLevelGroups } from './profileInventoryUtils';

export type ProfileStoryArtifactsSectionProps = {
    story: ProfileInventoryStory;
    displayTitle: string;
    missionsDisabled: boolean;
    onOpenMissions: () => void;
    onOpenArtifactDetail: (art: ProfileInventoryArtifact, qty: number) => void;
    artifactName: (code: string, name: string, nameEn: string | null) => string;
    t: (key: string) => string;
};

const ProfileStoryArtifactsSection: React.FC<ProfileStoryArtifactsSectionProps> = ({
    story,
    displayTitle,
    missionsDisabled,
    onOpenMissions,
    onOpenArtifactDetail,
    artifactName,
    t,
}) => {
    const levelGroups = useMemo(
        () => buildLevelGroups(story.artifacts, story.owned),
        [story.artifacts, story.owned],
    );

    return (
        <section className="flex flex-col gap-3">
            <button
                type="button"
                onClick={onOpenMissions}
                disabled={missionsDisabled}
                className="flex w-full min-w-0 justify-start rounded-lg py-1 text-left -mx-1 px-1 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white/25 disabled:opacity-60"
            >
                <span className="flex min-w-0 max-w-full items-center gap-4">
                    <span className="min-w-0 text-xl font-semibold leading-tight text-white">{displayTitle}</span>
                    <i className="fa-solid fa-chevron-right shrink-0 text-lg leading-none" aria-hidden />
                </span>
            </button>
            {story.artifacts.length === 0 ? (
                <p className="text-xs text-zinc-500">{t('profileNoArtifactsInStory')}</p>
            ) : (
                levelGroups.map((group, groupIdx) => {
                    const isPrevComplete = groupIdx === 0 || levelGroups[groupIdx - 1].isComplete;
                    return (
                        <ArtifactLevelSection
                            key={group.level}
                            group={group}
                            isPrevComplete={isPrevComplete}
                            hasNextLevel={groupIdx < levelGroups.length - 1}
                            owned={story.owned}
                            onOpenDetail={onOpenArtifactDetail}
                            artifactName={artifactName}
                            t={t}
                        />
                    );
                })
            )}
        </section>
    );
};

export default ProfileStoryArtifactsSection;
