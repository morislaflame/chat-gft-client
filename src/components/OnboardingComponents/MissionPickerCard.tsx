import React, { memo } from 'react';
import { motion } from 'motion/react';
import Button from '@/components/ui/button';
import { useTranslate } from '@/utils/useTranslate';
import type { Mission, MissionProgress } from '@/types/types';

export type MissionPickerCardProps = {
    mission: Mission;
    locked: boolean;
    /** Статус прогресса с сервера (подпись кнопки: старт / перепройти / продолжить реплей) */
    progressStatus?: MissionProgress['status'];
    onAction: () => void;
};

/**
 * Карточка миссии для экрана выбора (оформление как у MissionCard в чате).
 */
const MissionPickerCard: React.FC<MissionPickerCardProps> = memo(({ mission, locked, progressStatus, onAction }) => {
    const { t, language } = useTranslate();

    const missionTitle =
        language === 'en' ? (mission.titleEn ?? mission.title) : mission.title;
    const missionDescription =
        language === 'en'
            ? (mission.descriptionEn ?? mission.description)
            : mission.description;

    const buttonLabel = locked
        ? t('missionLocked')
        : progressStatus === 'replay_in_progress'
          ? t('missionReplayContinue')
          : progressStatus === 'completed'
            ? t('missionReplay')
            : t('start');

    return (
        <div className="flex justify-center w-full max-w-md mx-auto relative z-[2]">
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="btn-default-silver-border rounded-xl px-4 py-3 w-full bg-black/25 backdrop-blur-sm"
            >
                <div className="flex flex-col gap-1 mb-1">
                    <span className="text-sm font-semibold">
                        {t('mission')} {mission.orderIndex}
                    </span>
                    <span className="font-bold text-user-message-gradient text-lg italic">{missionTitle}</span>
                </div>
                {missionDescription ? (
                    <div className="text-sm text-gray-300 mt-1 line-clamp-4">{missionDescription}</div>
                ) : null}
                <div className="mt-3">
                    <Button
                        onClick={onAction}
                        disabled={locked}
                        variant="gradient"
                        size="sm"
                        className="w-full text-semibold"
                        icon={locked ? 'fas fa-lock' : 'fas fa-play'}
                    >
                        {buttonLabel}
                    </Button>
                </div>
            </motion.div>
        </div>
    );
});

MissionPickerCard.displayName = 'MissionPickerCard';

export default MissionPickerCard;
