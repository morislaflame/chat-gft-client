import React, { memo } from 'react';
import { motion } from 'motion/react';
import Button from '@/components/ui/button';
import { PressableRippleSurface } from '@/components/ui/pressable-ripple-surface';
import { cn } from '@/lib/utils';
import { useTranslate } from '@/utils/useTranslate';
import type { Message } from '@/types/types';
import type { Mission } from '@/types/types';

type MissionCardChatProps = {
    mode?: 'chat';
    message: Message;
    onStartMission: (orderIndex: number) => void;
    /** Клик по названию и описанию — модалка про артефакты (в т.ч. после старта миссии) */
    onOpenArtifactsExplainer?: () => void;
};

type MissionCardPickerProps = {
    mode: 'picker';
    mission: Mission;
    locked: boolean;
    completed: boolean;
    isSelected?: boolean;
    /** История по этой миссии загружается (кнопка в состоянии loading) */
    isLoading?: boolean;
    onSelect: () => void;
};

export type MissionCardProps = MissionCardChatProps | MissionCardPickerProps;

function isPicker(props: MissionCardProps): props is MissionCardPickerProps {
    return props.mode === 'picker';
}

const MissionCard: React.FC<MissionCardProps> = memo((props) => {
    const { t, language } = useTranslate();

    if (isPicker(props)) {
        const { mission, locked, completed, isSelected, isLoading = false, onSelect } = props;
        const missionTitle =
            language === 'en' ? mission.titleEn ?? mission.title : mission.title;
        const missionDescription =
            language === 'en'
                ? mission.descriptionEn ?? mission.description
                : mission.description;

        const buttonLabel = locked ? t('missionLocked') : completed ? t('missionReplay') : t('start');

        return (
            <div className="flex justify-center w-full">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                        'btn-default-silver-border rounded-xl px-4 py-3 inline-block max-w-md w-full transition-[box-shadow] duration-300',
                        isSelected &&
                            'shadow-[0_0_40px_hsl(var(--primary)/0.55),0_0_22px_hsl(var(--primary)/0.4),0_0_10px_hsl(var(--primary)/0.3),inset_0_0_24px_hsl(var(--primary)/0.12)]',
                    )}
                >
                    <div className="flex flex-col gap-1 mb-1">
                        <span className="text-sm font-semibold text-zinc-200">
                            {t('mission')} {mission.orderIndex}
                        </span>
                        <span className="font-bold text-user-message-gradient text-lg italic">{missionTitle}</span>
                    </div>
                    {missionDescription ? (
                        <div className="text-sm text-gray-300 mt-1 line-clamp-4">{missionDescription}</div>
                    ) : null}
                    <div className="mt-3">
                        <Button
                            onClick={onSelect}
                            disabled={locked || isLoading}
                            variant={locked ? 'default' : 'gradient'}
                            size="sm"
                            className="w-full"
                            state={isLoading ? 'loading' : 'default'}
                            icon={
                                isLoading
                                    ? undefined
                                    : locked
                                      ? 'fas fa-lock'
                                      : completed
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
                className="btn-default-silver-border rounded-xl px-4 py-3 inline-block max-w-md w-full"
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
                            onClick={() => onStartMission(message.mission!.orderIndex)}
                            variant="gradient"
                            size="sm"
                            className="w-full"
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
