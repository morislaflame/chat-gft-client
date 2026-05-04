import React, { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import type { ProfileInventoryArtifact, ProfileInventoryStory } from '@/types/types';
import ArtifactLevelSection from './ArtifactLevelSection';
import { buildLevelGroups } from './profileInventoryUtils';
import { motion } from 'motion/react';

export type ProfileStoryArtifactsSectionProps = {
    story: ProfileInventoryStory;
    onOpenArtifactDetail: (art: ProfileInventoryArtifact, qty: number) => void;
    artifactName: (code: string, name: string, nameEn: string | null) => string;
    t: (key: string) => string;
};

const ProfileStoryArtifactsSection: React.FC<ProfileStoryArtifactsSectionProps> = ({
    story,
    onOpenArtifactDetail,
    artifactName,
    t,
}) => {

    const levelGroups = useMemo(
        () => buildLevelGroups(story.artifacts, story.owned),
        [story.artifacts, story.owned],
    );

    return (
        <article className="flex flex-col gap-3">
            
            <Card className="flex flex-col gap-4 px-5 py-5">
                <motion.span
                    className="mb-2"
                >
                    <i className="fa-solid fa-info-circle text-zinc-400 mr-2 text-[12px]" />
                    <p className="text-sm inline text-zinc-400">{t('progressExplainer2')}</p>

                </motion.span>
                {story.artifacts.length === 0 ? (
                    <p className="text-sm leading-relaxed text-zinc-500">{t('profileNoArtifactsInStory')}</p>
                ) : (
                    <div className="flex flex-col gap-5">
                        {levelGroups.map((group, groupIdx) => {
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
                        })}
                    </div>
                )}
            </Card>
        </article>
    );
};

export default ProfileStoryArtifactsSection;
