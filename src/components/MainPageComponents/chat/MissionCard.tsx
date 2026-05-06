import React, { memo } from 'react';
import { motion } from 'motion/react';
import Button from '@/components/ui/button';
import { PressableRippleSurface } from '@/components/ui/pressable-ripple-surface';
import { cn } from '@/lib/utils';
import { useTranslate } from '@/utils/useTranslate';
import type { Message } from '@/types/types';
import type { Mission } from '@/types/types';
import type { MissionProgress } from '@/types/types';
import { listMissionUiStepGoals } from '@/utils/missionUiStepGoals';

type MissionCardChatProps = {
    mode?: 'chat';
    message: Message;
    onStartMission: (missionId: number) => void;
    /** Клик по названию и описанию — модалка про артефакты (в т.ч. после старта миссии) */
    onOpenArtifactsExplainer?: () => void;
};

type MissionCardPickerProps = {
    mode: 'picker';
    mission: Mission;
    progress?: MissionProgress;
    locked: boolean;
    isSelected?: boolean;
    /** История по этой миссии загружается (кнопка в состоянии loading) */
    isLoading?: boolean;
    onSelect: () => void;
};

export type MissionCardProps = MissionCardChatProps | MissionCardPickerProps;

function isPicker(props: MissionCardProps): props is MissionCardPickerProps {
    return props.mode === 'picker';
}

const MiniMissionProgressBar: React.FC<{
    currentStep: number;
    totalSteps: number;
    isCompletedMission: boolean;
}> = ({ currentStep, totalSteps, isCompletedMission }) => {
    const safeTotal = Math.max(1, totalSteps);
    const safeCurrent = Math.min(Math.max(1, currentStep), safeTotal);
    const completedCount = isCompletedMission ? safeTotal : Math.max(0, safeCurrent - 1);
    const visibleCount = isCompletedMission ? safeTotal : safeCurrent;
    const showTailAfterLastCircle = visibleCount < safeTotal;

    return (
        <div className="w-full flex items-center gap-1 min-w-0">
            {Array.from({ length: visibleCount }).map((_, idx) => {
                const isCompleted = idx < completedCount;
                const segmentGrow = isCompleted ? 1 : 0.9;
                const segmentFillPercent = isCompleted ? 100 : 0;

                return (
                    <React.Fragment key={`mini-mission-step-${idx}`}>
                        <motion.div
                            className="relative min-w-0 overflow-hidden flex items-center rounded-full border border-white/15 bg-black/40 backdrop-blur-md h-2"
                            style={{ flexBasis: 0 }}
                            animate={{ flexGrow: segmentGrow }}
                            transition={{ duration: 0.22, ease: 'easeOut' }}
                        >
                            <div className="absolute inset-0 rounded-full" aria-hidden />
                            <motion.div
                                className="absolute inset-y-0 left-0 rounded-full z-[1]"
                                style={{ background: 'var(--gradient-accent-color)' }}
                                initial={false}
                                animate={{ width: `${segmentFillPercent}%` }}
                                transition={{ duration: 0.28, ease: 'easeOut' }}
                            />
                        </motion.div>

                        <motion.div
                            className={`w-4 h-4 shrink-0 rounded-full flex items-center justify-center ${
                                isCompleted
                                    ? 'btn-default-silver-border'
                                    : 'border border-white/15 bg-black/40 backdrop-blur-md'
                            }`}
                            style={{
                                background: isCompleted ? 'var(--gradient-accent-color)' : undefined,
                                color: isCompleted ? '#fff' : 'rgb(156 163 175)',
                            }}
                            initial={false}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.2, ease: 'easeOut' }}
                        >
                            {isCompleted ? <i className="fa-solid fa-check text-[8px]" /> : null}
                        </motion.div>
                    </React.Fragment>
                );
            })}

            {showTailAfterLastCircle ? (
                <motion.div
                    className="h-2 rounded-full min-w-0 border border-white/15 bg-black/40 backdrop-blur-md"
                    style={{ flexBasis: 0 }}
                    animate={{ flexGrow: 0.18 }}
                    transition={{ duration: 0.22, ease: 'easeOut' }}
                />
            ) : null}
        </div>
    );
};

const MissionCard: React.FC<MissionCardProps> = memo((props) => {
    const { t, language } = useTranslate();

    if (isPicker(props)) {
        const { mission, progress, locked, isSelected, isLoading = false, onSelect } = props;
        const missionTitle =
            language === 'en' ? mission.titleEn ?? mission.title : mission.title;
        const missionDescription =
            language === 'en'
                ? mission.descriptionEn ?? mission.description
                : mission.description;

        const st = progress?.status;
        const isIdleCompleted = st === 'completed';
        const isReplayActive = st === 'replay_in_progress';
        const showStepsProgress =
            Boolean(progress) && !locked && (st === 'in_progress' || isReplayActive);

        const buttonLabel = locked
            ? t('missionLocked')
            : isReplayActive
              ? t('missionReplayContinue')
              : isIdleCompleted
                ? t('missionReplay')
                : t('start');
        const artifactProgressLabel = `${progress?.artifactsFound ?? 0}/${progress?.artifactsTotal ?? 0}`;
        const uiStepsCount = listMissionUiStepGoals(mission.uiStepGoals ?? null).length;
        const totalSteps = Number(progress?.mainStepsTotal ?? 0) || uiStepsCount || 1;
        const currentStep = Number(progress?.mainStep ?? 1) || 1;

        return (
            <div className="flex justify-center w-full">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                        'rounded-2xl border border-white/15 bg-black/40 backdrop-blur-md px-4 py-3 inline-block max-w-md w-full transition-[box-shadow] duration-300',
                        isSelected &&
                            'shadow-[0_0_30px_hsl(var(--primary)/0.55),0_0_20px_hsl(var(--primary)/0.4),0_0_10px_hsl(var(--primary)/0.3),inset_0_0_24px_hsl(var(--primary)/0.12)]',
                    )}
                >
                    <div className="flex flex-col gap-1 mb-1">
                        <div className="flex items-start justify-between gap-2">
                            <span className="text-sm font-semibold text-zinc-200">
                                {t('mission')} {mission.orderIndex}
                            </span>
                            {isIdleCompleted ? (
                                <span className="shrink-0 rounded-full border border-white/20 bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-300">
                                    {t('missionCompletedBadge')}
                                </span>
                            ) : null}
                        </div>
                        <span className="font-bold text-user-message-gradient text-lg italic">{missionTitle}</span>
                    </div>
                    {missionDescription ? (
                        <div className="text-sm text-gray-300 mt-1 line-clamp-4">{missionDescription}</div>
                    ) : null}
                    {progress && !locked ? (
                        <div className="mt-3 flex flex-col gap-2 text-xs">
                            {showStepsProgress ? (
                                <>
                                    <div className="relative z-10 w-full flex items-center px-4">
                                        <div className="flex-1 h-px bg-gradient-to-r from-transparent to-zinc-700/60" />
                                        <div className="flex items-center gap-1.5 px-3 py-1 text-xs text-zinc-400">
                                            {t('missionProgress')}
                                        </div>
                                        <div className="flex-1 h-px bg-gradient-to-l from-transparent to-zinc-700/60" />
                                    </div>
                                    <div className="w-full">
                                        <MiniMissionProgressBar
                                            currentStep={currentStep}
                                            totalSteps={totalSteps}
                                            isCompletedMission={false}
                                        />
                                    </div>
                                </>
                            ) : null}
                            <div className="flex items-center gap-2 justify-between">
                                <span className="text-zinc-400">{t('artifactsFound')}:</span>
                                <span className="text-artifact-gradient font-semibold">{artifactProgressLabel}</span>
                            </div>
                        </div>
                    ) : null}
                    <div className="mt-3">
                        <Button
                            onClick={onSelect}
                            disabled={locked || isLoading}
                            variant={locked ? 'default' : 'gradient'}
                            size="sm"
                            className="w-full text-semibold"
                            state={isLoading ? 'loading' : 'default'}
                            icon={
                                isLoading
                                    ? undefined
                                    : locked
                                      ? 'fas fa-lock'
                                      : isIdleCompleted
                                        ? 'fas fa-rotate-right'
                                        : 'fas fa-play'
                            }
                        >
                            {isLoading ? t('loading') : buttonLabel}
                        </Button>
                    </div>
                </motion.div>
            </div>
        );
    }

    const { message, onStartMission, onOpenArtifactsExplainer } = props;
    if (!message.mission) return null;

    const missionTitle =
        language === 'en'
            ? (message.mission.titleEn ?? message.mission.title)
            : message.mission.title;
    const missionDescription =
        language === 'en'
            ? (message.mission.descriptionEn ?? message.mission.description)
            : message.mission.description;

    const titleAndDescription = (
        <>
            <div className="flex flex-col gap-1 mb-1">
                <span className="text-sm font-semibold ">
                    {t('mission')} {message.mission.orderIndex}
                </span>
                <span className="font-bold text-user-message-gradient text-lg italic">{missionTitle}</span>
            </div>
            {missionDescription ? (
                <div className="text-sm text-gray-300 mt-1">{missionDescription}</div>
            ) : null}
        </>
    );

    return (
        <div className="flex justify-center mb-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-white/15 bg-black/40 backdrop-blur-md p-4 inline-block max-w-md w-full"
            >
                {onOpenArtifactsExplainer ? (
                    <PressableRippleSurface
                        type="button"
                        onClick={onOpenArtifactsExplainer}
                        rippleClassName="bg-white/35"
                        className="w-full rounded-lg border-0 bg-transparent p-0 text-left -mx-1 px-1 -mt-0.5 pt-0.5 hover:bg-white/[0.06]"
                    >
                        {titleAndDescription}
                    </PressableRippleSurface>
                ) : (
                    titleAndDescription
                )}
                {!message.missionHasMessages && (
                    <div className="mt-3">
                        <Button
                            onClick={() => onStartMission(message.mission!.id)}
                            variant="gradient"
                            size="sm"
                            className="w-full text-semibold"
                            icon="fas fa-play"
                        >
                            {t('start')}
                        </Button>
                    </div>
                )}
            </motion.div>
        </div>
    );
});

MissionCard.displayName = 'MissionCard';

export default MissionCard;
