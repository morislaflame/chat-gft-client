import React, { memo } from 'react';
import { motion } from 'motion/react';
import Button from '@/components/ui/button';
import { useTranslate } from '@/utils/useTranslate';
import type { Message } from '@/types/types';

interface MissionCardProps {
  message: Message;
  onStartMission: (orderIndex: number) => void;
}

const MissionCard: React.FC<MissionCardProps> = memo(({ message, onStartMission }) => {
  const { t, language } = useTranslate();

  if (!message.mission) return null;

  const missionTitle =
    language === 'en'
      ? (message.mission.titleEn ?? message.mission.title)
      : message.mission.title;
  const missionDescription =
    language === 'en'
      ? (message.mission.descriptionEn ?? message.mission.description)
      : message.mission.description;

  return (
    <div className="flex justify-center mb-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-outline-silver rounded-xl px-4 py-3 inline-block max-w-md w-full"
      >
        <div className="flex flex-col gap-1 mb-1">
          <span className="text-sm font-semibold ">
            {t('mission')} {message.mission.orderIndex}
          </span>
          <span className="font-bold text-user-message-gradient text-lg italic">{missionTitle}</span>
        </div>
        {missionDescription && (
          <div className="text-sm text-gray-300 mt-1">
            {missionDescription}
          </div>
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

