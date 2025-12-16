import React, { memo } from 'react';
import { motion } from 'motion/react';
import Button from '@/components/CoreComponents/Button';
import { useTranslate } from '@/utils/useTranslate';
import type { Message } from '@/types/types';

interface MissionCardProps {
  message: Message;
  onStartMission: (orderIndex: number) => void;
}

const MissionCard: React.FC<MissionCardProps> = memo(({ message, onStartMission }) => {
  const { t } = useTranslate();

  if (!message.mission) return null;

  return (
    <div className="flex justify-center mb-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-primary-800 rounded-xl px-4 py-3 inline-block max-w-md w-full"
      >
        <div className="flex items-center gap-2 mb-1">
          <span className="text-md font-semibold text-amber-400 flex flex-col gap-2">
            {t('mission')} {message.mission.orderIndex}
            <span className="font-medium text-gray-200 italic">{message.mission.title}</span>
          </span>
        </div>
        {message.mission.description && (
          <div className="text-sm text-gray-400 mt-1">
            {message.mission.description}
          </div>
        )}
        {!message.missionHasMessages && (
          <div className="mt-3">
            <Button
              onClick={() => onStartMission(message.mission!.orderIndex)}
              variant="secondary"
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

